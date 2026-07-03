import * as esbuild from "esbuild";
import * as fs from "node:fs";

const production = process.argv.includes("--production");
const common = {
  bundle: true,
  sourcemap: !production,
  minify: production,
  logLevel: "info" as const,
};

async function main(): Promise<void> {
  // Processus principal Electron (fenêtre de prévisualisation + export batch).
  await esbuild.build({
    ...common,
    entryPoints: ["src/main.ts"],
    outfile: "dist/main.js",
    platform: "node",
    format: "cjs",
    external: ["electron"],
  });

  // Page (navigateur) — la même pour Electron et pour GitHub Pages.
  await esbuild.build({
    ...common,
    entryPoints: ["src/app.ts"],
    outfile: "dist/app.js",
    platform: "browser",
    format: "iife",
  });
  fs.copyFileSync("src/index.html", "dist/index.html");

  fs.mkdirSync("dist-web", { recursive: true });
  fs.copyFileSync("src/index.html", "dist-web/index.html");
  fs.copyFileSync("dist/app.js", "dist-web/app.js");
  fs.copyFileSync("src/pirate.js", "dist-web/pirate.js");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
