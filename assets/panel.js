import { DESTINATION_EMAIL, escapeHTML, loadRequests, saveRequests, statusClass, statusRank } from "./app.js";

let requests = loadRequests();
let selectedId = new URLSearchParams(window.location.search).get("request") || requests[0]?.id || null;
const elements = {
  list: document.querySelector("#request-list"), empty: document.querySelector("#empty-state"),
  search: document.querySelector("#search-filter"), project: document.querySelector("#project-filter"), status: document.querySelector("#status-filter"),
  detailPlaceholder: document.querySelector("#detail-placeholder"), detailContent: document.querySelector("#detail-content"), confirmation: document.querySelector("#panel-confirmation")
};

function filteredRequests() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  return requests.filter((request) => {
    const textMatches = !query || request.name.toLocaleLowerCase().includes(query) || request.email.toLocaleLowerCase().includes(query);
    return textMatches && (!elements.project.value || request.project === elements.project.value) && (!elements.status.value || request.status === elements.status.value);
  });
}

function renderMetrics() {
  const count = (statuses) => requests.filter((request) => statuses.includes(request.status)).length;
  document.querySelector("#metric-total").textContent = requests.length;
  document.querySelector("#metric-review").textContent = count(["Nueva", "Filtrada"]);
  document.querySelector("#metric-ready").textContent = count(["Lista para derivar"]);
  document.querySelector("#metric-forwarded").textContent = count(["Derivada al correo"]);
  document.querySelector("#sidebar-count").textContent = requests.length;
}

function renderList() {
  const visible = filteredRequests();
  elements.list.innerHTML = visible.map((request) => `
    <button class="request-row ${request.id === selectedId ? "is-selected" : ""}" type="button" data-request="${escapeHTML(request.id)}" aria-label="Abrir solicitud de ${escapeHTML(request.name)}">
      <span class="row-project"><b>${escapeHTML(request.project)}</b><small>${escapeHTML(request.id)} · demostración</small></span>
      <span class="row-contact">${escapeHTML(request.name)}<small>${escapeHTML(request.email)}</small></span>
      <span class="status-badge ${statusClass(request.status)}">${escapeHTML(request.status)}</span>
      <span class="row-date">${escapeHTML(request.receivedAt)}</span>
    </button>`).join("");
  elements.empty.hidden = Boolean(visible.length);
  document.querySelector("#filter-result").textContent = visible.length === 1 ? "1 solicitud coincide con los filtros." : `${visible.length} solicitudes coinciden con los filtros.`;
  elements.list.querySelectorAll("[data-request]").forEach((button) => button.addEventListener("click", () => { selectedId = button.dataset.request; render(); }));
}

function timeline(request) {
  const rank = statusRank(request.status);
  const steps = [
    ["Solicitud registrada", "Datos iniciales disponibles en la bandeja de demostración."],
    ["Revisión visual", "Acción manual representada; no aplica reglas reales de filtrado."],
    ["Lista para derivar", "Estado visual previo a una derivación conceptual."],
    ["Derivación al correo", `Destino visual: ${DESTINATION_EMAIL}. No se envió un correo.`]
  ];
  return steps.map(([title, note], index) => `<li class="${index <= rank ? "is-done" : ""} ${index === rank ? "is-current" : ""}"><span>${index < rank ? "✓" : index + 1}</span><div><strong>${title}</strong><p>${note}</p></div></li>`).join("");
}

function actionMarkup(request) {
  if (request.status === "Nueva") return `<button class="button button-dark button-full" type="button" data-next="Filtrada">Registrar revisión simulada <span>→</span></button>`;
  if (request.status === "Filtrada") return `<button class="button button-dark button-full" type="button" data-next="Lista para derivar">Marcar lista para derivar <span>→</span></button>`;
  if (request.status === "Lista para derivar") return `<button class="button button-primary button-full" type="button" data-next="Derivada al correo">Derivar solicitud <span>→</span></button>`;
  return `<button class="button button-muted button-full" type="button" disabled>Derivación simulada ✓</button>`;
}

function renderDetail() {
  const request = requests.find((item) => item.id === selectedId);
  elements.detailPlaceholder.hidden = Boolean(request);
  elements.detailContent.hidden = !request;
  if (!request) return;
  document.querySelector("#detail-id").textContent = request.id;
  const badge = document.querySelector("#detail-status");
  badge.textContent = request.status;
  badge.className = `status-badge ${statusClass(request.status)}`;
  document.querySelector("#detail-project").textContent = request.project;
  document.querySelector("#detail-date").textContent = request.receivedAt;
  ["name", "zone", "nit", "email"].forEach((field) => { document.querySelector(`#detail-${field}`).textContent = request[field]; });
  document.querySelector("#request-timeline").innerHTML = timeline(request);
  document.querySelector("#mail-copy").textContent = request.status === "Derivada al correo"
    ? `Derivación simulada registrada para ${DESTINATION_EMAIL}. El estado cambió visualmente; no se envió ningún correo.`
    : "La derivación se muestra cuando la solicitud alcanza el estado visual “Lista para derivar”.";
  const actions = document.querySelector("#detail-actions");
  actions.innerHTML = actionMarkup(request);
  actions.querySelector("[data-next]")?.addEventListener("click", (event) => updateStatus(event.currentTarget.dataset.next));
}

function updateStatus(nextStatus) {
  const request = requests.find((item) => item.id === selectedId);
  if (!request) return;
  request.status = nextStatus;
  if (nextStatus === "Derivada al correo") request.forwardedTo = DESTINATION_EMAIL;
  saveRequests(requests);
  const message = nextStatus === "Derivada al correo"
    ? `Derivación simulada: ${request.name} aparece como “Derivada al correo” para ${DESTINATION_EMAIL}. No se envió un correo real.`
    : `Acción simulada: ${request.name} ahora aparece como “${nextStatus}”. No representa una regla real de filtrado.`;
  elements.confirmation.textContent = message;
  render();
}

function render() { renderMetrics(); renderList(); renderDetail(); }

[elements.search, elements.project, elements.status].forEach((filter) => filter.addEventListener("input", render));
render();
