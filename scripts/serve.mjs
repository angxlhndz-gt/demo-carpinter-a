import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const types = { ".css": "text/css", ".html": "text/html", ".js": "application/javascript" };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname === "/reywood" ? "reywood/index.html" : pathname.endsWith("/") ? `${pathname.slice(1)}index.html` : pathname.slice(1);
  const file = normalize(join(root, relativePath));
  if (!file.startsWith(root)) { response.writeHead(403).end(); return; }
  try {
    const info = await stat(file);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "Content-Type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8` });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () => console.log("Demo disponible en http://127.0.0.1:4173/reywood/"));
