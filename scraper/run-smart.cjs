const fs = require("fs");
const { spawn } = require("child_process");

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: true });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} terminó con código ${code}`));
    });
  });
}

async function main() {
  const exists = fs.existsSync("campeones.json");

  if (!exists) {
    console.log("No existe campeones.json -> haciendo scraping...");
    await run("node", ["scraping-champs.cjs"]);
  }

  console.log("Importando datos al backend...");
  await run("node", ["import-from-json.cjs"]);

  console.log("Proceso completado.");
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});