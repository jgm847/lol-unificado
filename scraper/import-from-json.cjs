const fs = require("fs");

const API_URL = process.env.API_URL || "http://backend:8080/api/custom/champions/bulk";

async function waitForBackend(url, retries = 30, delay = 3000) {
  const healthUrl = url.replace("/bulk", "");

  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        console.log("Backend disponible.");
        return;
      }
    } catch (e) {}

    console.log(`Esperando backend... intento ${i + 1}/${retries}`);
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("El backend no estuvo disponible a tiempo.");
}

async function main() {
  if (!fs.existsSync("campeones.json")) {
    throw new Error("No existe campeones.json.");
  }

  const raw = fs.readFileSync("campeones.json", "utf-8");
  const campeones = JSON.parse(raw);

  console.log(`Campeones a importar: ${campeones.length}`);

  await waitForBackend(API_URL);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(campeones)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error ${response.status}: ${text}`);
  }

  console.log("Importación completada correctamente.");
}

main().catch((err) => {
  console.error("Fallo al importar:", err.message);
  process.exit(1);
});