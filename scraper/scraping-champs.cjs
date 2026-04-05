const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");

var browser;
var page;

campeones = [];

function clean(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function toNumberOrNull(value) {
  const v = clean(value).replace(/[^\d]/g, "");
  return v ? Number(v) : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function toLoLUrl(champUrl) {
  // champUrl: https://leagueoflegends.fandom.com/es/wiki/Aatrox
  // lolUrl:   https://leagueoflegends.fandom.com/es/wiki/Aatrox/LoL
  if (!champUrl) return null;
  if (champUrl.includes("/LoL")) return champUrl;
  return champUrl.replace(/\/$/, "") + "/LoL";
}

async function getWebPage(webPage, selector) {
  this.browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  this.page = await this.browser.newPage();

  await this.page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36"
  );

  await this.page.setExtraHTTPHeaders({
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
  });

  await this.page.setViewport({ width: 1366, height: 768 });

  await this.page.goto(webPage, { waitUntil: "networkidle2" });
  await this.page.waitForSelector(selector, { timeout: 20000 });

  return await this.page.content();
}

function championTitleToPath(nombre) {
  // 1) espacios a _
  const withUnderscore = (nombre || "").trim().replace(/\s+/g, "_");
  // 2) encodea caracteres especiales (incluye ' -> %27)
  //    encodeURIComponent no cambia '_' ni '.'
  return encodeURIComponent(withUnderscore);
}

function buildLoLUrlFromName(nombre) {
  const title = championTitleToPath(nombre);
  return `https://leagueoflegends.fandom.com/es/wiki/${title}/LoL`;
}

function pickChampionLink($, cell) {
  const links = $(cell)
    .find('a[href^="/es/wiki/"]')
    .toArray()
    .filter((a) => {
      const href = $(a).attr("href") || "";
      return !href.includes("/es/wiki/Archivo:");
    });

  if (!links.length) return null;

  const withText = links.find((a) => clean($(a).text()).length > 0);
  return withText || links[links.length - 1];
}

function removePQWERPrefix(text) {
  let t = clean(text);

  // Quita "PQWER" pegado o separado por espacios
  // Ej: "PQWER Pelea Sucio" -> "Pelea Sucio"
  //     "P Q W E R Pelea Sucio" -> "Pelea Sucio"
  t = t.replace(/^(?:P\s*Q\s*W\s*E\s*R|PQWER)\s*/i, "");

  // Por si viene repetido o con símbolos raros
  t = t.replace(/^(?:P\s*Q\s*W\s*E\s*R|PQWER)\s*/i, "");

  return t;
}

function splitNombreDescripcion(nombreRaw, descripcionRaw, championName) {
  let nombre = clean(nombreRaw || "");
  let descripcion = clean(descripcionRaw || "");

  // Quitar punto inicial típico ". ..."
  if (descripcion.startsWith(".")) descripcion = clean(descripcion.slice(1));

  // Caso 1: ya viene bien por Pasiva/Activa
  // (si aquí no entra, seguimos)
  const pasivaIdx = nombre.indexOf(" Pasiva:");
  const activaIdx = nombre.indexOf(" Activa:");
  let cut = -1;
  if (pasivaIdx !== -1) cut = pasivaIdx;
  else if (activaIdx !== -1) cut = activaIdx;

  if (cut !== -1) {
    const n = clean(nombre.slice(0, cut));
    const d = clean(nombre.slice(cut) + " " + descripcion);
    return { nombre: n, descripcion: d || null };
  }

  // Caso 2: el "nombre" trae descripción pegada: cortar por el nombre del campeón
  // Ej: "Furia... Shyvana inflige..." => nombre="Furia...", descripcion="Shyvana inflige..."
  if (championName) {
    const champ = clean(championName).split(",")[0].trim(); // por seguridad
    const idx = nombre.toLowerCase().indexOf((" " + champ + " ").toLowerCase());
    if (idx !== -1) {
      const n = clean(nombre.slice(0, idx));
      const d = clean(nombre.slice(idx + 1) + " " + descripcion); // +1 para quitar el espacio inicial
      return { nombre: n || nombre, descripcion: d || null };
    }
  }

  // Caso 3: si descripcion era ".", la pasamos a null
  if (descripcion === "." || descripcion === "") descripcion = null;

  return { nombre, descripcion };
}

async function scrapeHabilidades(lolUrl, champName) {
  if (!lolUrl) return [];

  try {
    await this.page.goto(lolUrl, { waitUntil: "networkidle2" });
    await this.page.waitForSelector("body", { timeout: 20000 });

    const html = await this.page.content();
    const $ = cheerio.load(html);

    let champNameFormatted = championTitleToPath(champName);

    const champKey = (champNameFormatted || "")
        .trim()
        .replace(/\s+/g, "_")
        .replace(/'/g, "")
        .toLowerCase();

    const allSkillImages = $("img")
        .toArray()
        .map(img => {
            let src = $(img).attr("data-src") || $(img).attr("src") || null;
            if (!src) return null;
            src = src.replace(/&amp;/g, "&");
            if (src.startsWith("//")) src = "https:" + src;
            return src;
        })
        .filter(Boolean)
        .filter(src => src.toLowerCase().includes(champKey));

    // Buscamos cualquier H2 que contenga "habilidad" (Akali y otros pueden variar)
    const habilidadesH2 = $("h2").toArray().find((h2) => {
      const t = clean($(h2).text()).toLowerCase();
      return t.includes("habilidad"); // cubre "habilidades" y textos raros
    });

    if (!habilidadesH2) return [];

    // Cogemos todo el texto desde ese H2 hasta el siguiente H2
    let cur = $(habilidadesH2).next();
    const parts = [];

    while (cur.length && !cur.is("h2")) {
      const t = clean(cur.text());
      if (t) parts.push(t);
      cur = cur.next();
    }

    // Unimos todo en un texto grande
    const bigText = clean(parts.join(" "));

    // Partimos por "Leer más" (con tolerancia a mayúsculas)
    // Esto suele generar 5 bloques (uno por habilidad)
    const blocks = bigText
      .split(/leer más/i)
      .map((b) => clean(b))
      .filter(Boolean);

    const keys = ["P", "Q", "W", "E", "R"];
    const habilidades = [];

    // Para cada bloque: la primera parte es "Nombre ..." y la descripción es el resto.
    // Como el bloque normalmente viene: "Nombre Pasiva/Activa: ...", lo separamos así:
    for (let i = 0; i < Math.min(5, blocks.length); i++) {
      const block = blocks[i];

      // Intento separar nombre y descripción:
      // 1) si aparece " Pasiva:" o " Activa:" usamos eso como corte
      let nombre = null;
      let descripcion = null;

      const pasivaIdx = block.indexOf(" Pasiva:");
      const activaIdx = block.indexOf(" Activa:");

      let cut = -1;
      if (pasivaIdx !== -1) cut = pasivaIdx;
      else if (activaIdx !== -1) cut = activaIdx;

      if (cut !== -1) {
        nombre = removePQWERPrefix(block.slice(0, cut));
        descripcion = clean(block.slice(cut)); // incluye "Pasiva:/Activa:" y el resto
      } else {
        // fallback: si no hay Pasiva/Activa, usa primera frase como "nombre"
        const firstSentence = block.split(".")[0];
        nombre = removePQWERPrefix(firstSentence);
        descripcion = clean(block.slice(firstSentence.length));
      }

    const fixed = splitNombreDescripcion(nombre, descripcion, champName);
    nombre = fixed.nombre;
    descripcion = fixed.descripcion;

      // 🔧 Arreglo para "En construcción"
    if (nombre && /en construcción/i.test(nombre)) {
        nombre = nombre.replace(/en construcción/i, "").trim();
        if (!descripcion || descripcion === ".") {
            descripcion = "En construcción.";
        }
    }

      habilidades.push({
        habilidad: keys[i] || null,
        nombre: nombre || null,
        descripcion: descripcion || null,
        urlImagenHabilidad: allSkillImages[i+1] || null,
      });
    }

    console.log(habilidades);
    return habilidades;
  } catch (e) {
    return [];
  }
}

async function init() {
  const listUrl = "https://leagueoflegends.fandom.com/es/wiki/Lista_de_campeones";

  console.log("Cargando lista de campeones...");
  const content = await getWebPage(listUrl, "table");

  const $ = cheerio.load(content);

  // Tabla correcta por cabecera
  let table = null;
  $("table").each((i, t) => {
    const header = clean($(t).find("tr").first().text());
    if (header.includes("Campeón") && header.includes("Clases") && header.includes("Fecha")) {
      table = t;
      return false;
    }
  });

  if (!table) {
    console.log("No se encontró la tabla de campeones.");
    await this.browser.close();
    return;
  }

  const filas = $(table).find("tbody > tr");

  // 1) Sacar datos base (tabla)
  filas.each((index, element) => {
    const celdas = $(element).children("th, td");
    if (celdas.length < 6) return;

    const champCell = $(celdas[0]);
    const champLink = pickChampionLink($, champCell);

    let nombreCompleto = champLink
        ? clean($(champLink).text())
        : clean(champCell.text());

    let nombre = nombreCompleto.split(",")[0].trim();

    const lolUrl = buildLoLUrlFromName(nombre);
    const href = champLink ? $(champLink).attr("href") : null;
    const champUrl = href ? "https://leagueoflegends.fandom.com" + href : null;

    // Imagen (src o data-src)
    const imgTag = champCell.find("img").first();
    let imagen = null;
    if (imgTag.length) {
      imagen = imgTag.attr("data-src") || imgTag.attr("src") || null;
      if (imagen && imagen.startsWith("//")) imagen = "https:" + imagen;
    }

    const clasesText = clean($(celdas[1]).text());
    const clases = clasesText
      ? clasesText.split(/·|\/|,|\n/).map((x) => clean(x)).filter(Boolean)
      : [];

    const fechaLanzamiento = clean($(celdas[2]).text()) || null;
    const ultimoCambio = clean($(celdas[3]).text()) || null;
    const esenciaAzul = toNumberOrNull($(celdas[4]).text());
    const riotPoints = toNumberOrNull($(celdas[5]).text());

    if (!nombre) return;

    this.campeones.push({
      urlImagenCampeon: imagen,
      nombre: nombre,
      clases: clases,
      fechaLanzamiento: fechaLanzamiento,
      ultimoCambio: ultimoCambio,
      esenciaAzul: esenciaAzul,
      riotPoints: riotPoints,
      lolUrl: lolUrl,
      habilidades: [] // lo rellenamos después
    });
  });

  console.log(`Campeones detectados: ${this.campeones.length}`);
  console.log("Entrando en cada campeón para sacar habilidades (con pausas)...");

  // 2) Entrar 1 a 1 para sacar habilidades (sin paralelizar, más ético y menos bloqueos)
  for (let i = 0; i < this.campeones.length; i++) {
    const champ = this.campeones[i];

    // pausa suave para no machacar el servidor
    await sleep(1200);

    champ.habilidades = await scrapeHabilidades(champ.lolUrl, champ.nombre);

    console.log(
      `[${i + 1}/${this.campeones.length}] ${champ.nombre} -> habilidades: ${champ.habilidades.length}`
    );
  }

  fs.writeFileSync("campeones.json", JSON.stringify(this.campeones, null, 2), "utf-8");
  console.log("OK → Guardado campeones.json");
  await this.browser.close();
}

init().catch(async (err) => {
  console.error("Error:", err.message);
  try { if (browser) await browser.close(); } catch (e) {}
  process.exit(1);
});