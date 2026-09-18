import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "dist");
const types = { ".css": "text/css", ".html": "text/html", ".js": "application/javascript" };
const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = pathname === "/" ? "index.html" : pathname.slice(1);
  const candidate = normalize(join(root, relativePath));
  if (!candidate.startsWith(root)) { response.writeHead(403).end(); return; }
  const candidates = pathname.endsWith("/") ? [join(candidate, "index.html")] : [candidate, join(candidate, "index.html")];
  let file;
  for (const current of candidates) {
    try {
      if ((await stat(current)).isFile()) { file = current; break; }
    } catch { /* Probar la siguiente ruta candidata. */ }
  }
  if (!file) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": `${types[extname(file)] || "application/octet-stream"}; charset=utf-8` });
  createReadStream(file).pipe(response);
});
server.listen(4173, "127.0.0.1", () => console.log("Demo disponible en http://127.0.0.1:4173/reywood/"));
