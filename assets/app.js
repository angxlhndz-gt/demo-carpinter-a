export const STORAGE_KEY = "reywood-demo-requests-v2";
export const DESTINATION_EMAIL = "cotizaciones@carpinteriareywood.com";

const seedRequests = [
  { id: "DEM-COC-001", project: "Cocina", name: "Andrea Ejemplo", zone: "Zona de demostración 1", nit: "0000000-0", email: "andrea.ejemplo@demo.local", receivedAt: "18 sep 2026 · 09:10", status: "Nueva", isDemo: true },
  { id: "DEM-CLO-002", project: "Clóset", name: "Marcos Ejemplo", zone: "Zona de demostración 2", nit: "0000001-1", email: "marcos.ejemplo@demo.local", receivedAt: "18 sep 2026 · 09:18", status: "Filtrada", isDemo: true },
  { id: "DEM-LAV-003", project: "Módulos de lavamanos", name: "Laura Ejemplo", zone: "Zona de demostración 3", nit: "0000002-2", email: "laura.ejemplo@demo.local", receivedAt: "18 sep 2026 · 09:26", status: "Lista para derivar", isDemo: true }
];

export function loadRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : structuredClone(seedRequests);
  } catch {
    return structuredClone(seedRequests);
  }
}

export function saveRequests(requests) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(requests)); } catch { /* La demo sigue disponible aunque el navegador bloquee almacenamiento. */ }
}

export function createRequest(project, fields) {
  const receivedAt = new Intl.DateTimeFormat("es-GT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    .format(new Date()).replace(".", "").replace(",", " ·");
  return {
    id: `DEM-${Date.now().toString().slice(-6)}`,
    project,
    name: fields.name,
    zone: fields.zone,
    nit: fields.nit,
    email: fields.email,
    receivedAt,
    status: "Nueva",
    isDemo: true
  };
}

export function statusClass(status) {
  return `status-${status.replaceAll(" ", "-")}`;
}

export function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

export function statusRank(status) {
  return ["Nueva", "Filtrada", "Lista para derivar", "Derivada al correo"].indexOf(status);
}
