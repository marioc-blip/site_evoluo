import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = new URL("../dist/", import.meta.url).pathname;
const port = Number(process.env.PORT || 5174);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "/" ? "index.html" : safePath);

  if (existsSync(filePath) && statSync(filePath).isFile()) return filePath;
  return join(root, "index.html");
}

const server = createServer((request, response) => {
  const filePath = resolvePath(request.url || "/");
  response.setHeader("Content-Type", types[extname(filePath)] || "application/octet-stream");
  response.setHeader("Cache-Control", "no-store, must-revalidate");
  createReadStream(filePath).pipe(response);
});

server.listen(port, "localhost", () => {
  console.log(`Local server running at http://localhost:${port}/`);
});
