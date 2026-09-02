import { createClient } from "@supabase/supabase-js";
import { readFile } from "node:fs/promises";

async function loadLocalEnv() {
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
}

await loadLocalEnv();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase
  .from("blog_posts")
  .select("title,slug,published_at")
  .eq("status", "published")
  .order("published_at", { ascending: false });

if (error) throw error;
console.log(JSON.stringify(data, null, 2));
