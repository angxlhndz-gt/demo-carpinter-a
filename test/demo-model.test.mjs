import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(new URL("../reywood/index.html", import.meta.url), "utf8");
const panelHtml = await readFile(new URL("../reywood/panel/index.html", import.meta.url), "utf8");
const app = await readFile(new URL("../assets/app.js", import.meta.url), "utf8");
const panel = await readFile(new URL("../assets/panel.js", import.meta.url), "utf8");

test("la demo solo expone los tres tipos de proyecto confirmados", () => {
  assert.match(html, /data-project="Cocina"/);
  assert.match(html, /data-project="Clóset"/);
  assert.match(html, /data-project="Módulos de lavamanos"/);
  assert.equal((html.match(/data-project=/g) || []).length, 3);
});

test("el formulario contiene exclusivamente los cuatro campos confirmados", () => {
  ["name", "zone", "nit", "email"].forEach((field) => assert.match(html, new RegExp(`id="${field}"`)));
  const form = html.match(/<form id="request-form"[\s\S]*?<\/form>/)?.[0] || "";
  assert.equal((form.match(/<input /g) || []).length, 4);
});

test("el flujo conserva y deriva la solicitud solo como simulación", () => {
  assert.match(app, /localStorage/);
  assert.match(app, /cotizaciones@carpinteriareywood\.com/);
  assert.match(app, /Derivada al correo/);
  assert.match(html, /no se envía un correo real/i);
});

test("la página pública y el panel interno quedan separados", () => {
  assert.match(html, /href="\/reywood\/panel\//);
  assert.match(panelHtml, /Panel interno/);
  assert.match(panelHtml, /href="\/reywood\//);
});

test("el panel representa seguimiento, filtrado y derivación sin reglas reales", () => {
  assert.match(panelHtml, /Seguimiento simulado/);
  assert.match(panel, /Registrar revisión simulada/);
  assert.match(panel, /Marcar lista para derivar/);
  assert.match(panel, /Derivar solicitud/);
  assert.match(panel, /No representa una regla real de filtrado/);
});
