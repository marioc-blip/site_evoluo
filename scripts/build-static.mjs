import { build } from "esbuild";
import { copyFile, readFile } from "node:fs/promises";

async function loadLocalEnv() {
  try {
    const envFile = await readFile(".env.local", "utf8");

    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
      if (key && process.env[key] === undefined) process.env[key] = value;
    }
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

await loadLocalEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY ?? "";

await build({
  entryPoints: ["src/main.tsx"],
  bundle: true,
  alias: { "@": "./src" },
  outfile: "public/app.js",
  format: "esm",
  jsx: "automatic",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  minify: true,
  logLevel: "info",
  define: {
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(supabaseAnonKey),
  },
});

await build({
  entryPoints: ["src/styles.css"],
  bundle: true,
  outfile: "public/assets/custom.css",
  minify: true,
  logLevel: "info",
});

await copyFile("index.html", "public/index.html");
