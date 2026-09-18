const STORAGE_KEY = "reywood-demo-requests-v1";
const DESTINATION_EMAIL = "cotizaciones@carpinteriareywood.com";

const seedRequests = [
  {
    id: "DEM-COC-001",
    project: "Cocina",
    name: "Andrea Ejemplo",
    zone: "Zona de demostración 1",
    nit: "0000000-0",
    email: "andrea.ejemplo@demo.local",
    receivedAt: "18 sep 2026, 09:10",
    status: "Nueva",
    isDemo: true
  },
  {
    id: "DEM-CLO-002",
    project: "Clóset",
    name: "Marcos Ejemplo",
    zone: "Zona de demostración 2",
    nit: "0000001-1",
    email: "marcos.ejemplo@demo.local",
    receivedAt: "18 sep 2026, 09:18",
    status: "Filtrada",
    isDemo: true
  },
  {
    id: "DEM-LAV-003",
    project: "Módulos de lavamanos",
    name: "Laura Ejemplo",
    zone: "Zona de demostración 3",
    nit: "0000002-2",
    email: "laura.ejemplo@demo.local",
    receivedAt: "18 sep 2026, 09:26",
    status: "Lista para derivar",
    isDemo: true
  }
];

const state = {
  selectedProject: "",
  selectedRequestId: null,
  requests: loadRequests()
};

const projectCards = [...document.querySelectorAll(".project-card")];
const projectStep = document.querySelector("#project-step");
const formStep = document.querySelector("#form-step");
const requestForm = document.querySelector("#request-form");
const formInputs = [...requestForm.querySelectorAll("input")];
const requestList = document.querySelector("#request-list");
const detailPlaceholder = document.querySelector("#detail-placeholder");
const detailContent = document.querySelector("#detail-content");
const detail = {
  id: document.querySelector("#detail-id"),
  status: document.querySelector("#detail-status"),
  project: document.querySelector("#detail-project"),
  date: document.querySelector("#detail-date"),
  name: document.querySelector("#detail-name"),
  zone: document.querySelector("#detail-zone"),
  nit: document.querySelector("#detail-nit"),
  email: document.querySelector("#detail-email"),
  mailCopy: document.querySelector("#mail-copy")
};

function loadRequests() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) && stored.length ? stored : [...seedRequests];
  } catch {
    return [...seedRequests];
  }
}

function saveRequests() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.requests));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}

function statusClass(status) {
  return `status-${status.replaceAll(" ", "-")}`;
}

function chooseProject(project) {
  state.selectedProject = project;
  projectCards.forEach((card) => {
    const isSelected = card.dataset.project === project;
    card.classList.toggle("is-selected", isSelected);
    card.setAttribute("aria-checked", String(isSelected));
  });
  document.querySelector("#project-error").hidden = true;
  document.querySelector("#selected-project-label").textContent = project;
  updateSummary();
}

function goToForm() {
  if (!state.selectedProject) {
    document.querySelector("#project-error").hidden = false;
    return;
  }
  projectStep.hidden = true;
  formStep.hidden = false;
  setStep(2);
  document.querySelector("#name").focus();
}

function setStep(current) {
  document.querySelector("#step-current").textContent = current;
  document.querySelectorAll(".step").forEach((step) => step.classList.toggle("is-active", Number(step.dataset.step) <= current));
}

function updateSummary() {
  const getValue = (field) => document.querySelector(`#${field}`).value.trim() || "Pendiente";
  document.querySelector('[data-summary="project"]').textContent = state.selectedProject || "—";
  ["name", "zone", "nit", "email"].forEach((field) => {
    document.querySelector(`[data-summary="${field}"]`).textContent = getValue(field);
  });
}

function validateForm() {
  const fields = {
    name: "Indique su nombre.",
    zone: "Indique su zona.",
    nit: "Indique su NIT.",
    email: "Indique su correo electrónico."
  };
  let isValid = true;
  Object.entries(fields).forEach(([field, requiredMessage]) => {
    const input = document.querySelector(`#${field}`);
    const error = document.querySelector(`#${field}-error`);
    let message = "";
    if (!input.value.trim()) message = requiredMessage;
    if (field === "email" && input.value.trim() && !input.validity.valid) message = "Ingrese un correo electrónico válido.";
    error.textContent = message;
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
    if (message) isValid = false;
  });
  return isValid;
}

function createRequest() {
  const now = new Date();
  const date = new Intl.DateTimeFormat("es-GT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    .format(now).replace(".", "").replace(",", " ·");
  return {
    id: `DEM-${Date.now().toString().slice(-6)}`,
    project: state.selectedProject,
    name: document.querySelector("#name").value.trim(),
    zone: document.querySelector("#zone").value.trim(),
    nit: document.querySelector("#nit").value.trim(),
    email: document.querySelector("#email").value.trim(),
    receivedAt: date,
    status: "Nueva",
    isDemo: true
  };
}

function getFilteredRequests() {
  const query = document.querySelector("#search-filter").value.trim().toLocaleLowerCase();
  const project = document.querySelector("#project-filter").value;
  const status = document.querySelector("#status-filter").value;
  return state.requests.filter((request) => {
    const matchesQuery = !query || request.name.toLocaleLowerCase().includes(query) || request.email.toLocaleLowerCase().includes(query);
    return matchesQuery && (!project || request.project === project) && (!status || request.status === status);
  });
}

function renderList() {
  const requests = getFilteredRequests();
  document.querySelector("#request-count").textContent = state.requests.length;
  requestList.innerHTML = requests.map((request) => `
    <button class="request-row ${request.id === state.selectedRequestId ? "is-selected" : ""}" type="button" data-request-id="${escapeHTML(request.id)}" aria-label="Abrir solicitud de ${escapeHTML(request.name)}">
      <span class="row-project"><span>${escapeHTML(request.project)}</span><small>${escapeHTML(request.id)} · datos de demostración</small></span>
      <span class="row-contact">${escapeHTML(request.name)}<small>${escapeHTML(request.email)}</small></span>
      <span class="status-badge ${statusClass(request.status)}">${escapeHTML(request.status)}</span>
      <span class="row-date">${escapeHTML(request.receivedAt)}</span>
    </button>`).join("");
  document.querySelector("#empty-state").hidden = Boolean(requests.length);
  requestList.querySelectorAll("[data-request-id]").forEach((button) => {
    button.addEventListener("click", () => selectRequest(button.dataset.requestId));
  });
  if (state.selectedRequestId && !state.requests.some((request) => request.id === state.selectedRequestId)) selectRequest(null);
}

function selectRequest(id) {
  state.selectedRequestId = id;
  const request = state.requests.find((item) => item.id === id);
  detailPlaceholder.hidden = Boolean(request);
  detailContent.hidden = !request;
  if (!request) return renderList();
  detail.id.textContent = request.id;
  detail.status.textContent = request.status;
  detail.status.className = `status-badge ${statusClass(request.status)}`;
  detail.project.textContent = request.project;
  detail.date.textContent = request.receivedAt;
  detail.name.textContent = request.name;
  detail.zone.textContent = request.zone;
  detail.nit.textContent = request.nit;
  detail.email.textContent = request.email;
  detail.mailCopy.textContent = request.status === "Derivada al correo"
    ? `Derivación simulada para ${DESTINATION_EMAIL}. Estado visual actualizado; no se envió un correo real.`
    : "Aún no se ha simulado la derivación de esta solicitud.";
  document.querySelector("#forward-button").textContent = request.status === "Derivada al correo" ? "Derivación simulada" : "Derivar solicitud →";
  document.querySelector("#forward-button").disabled = request.status === "Derivada al correo";
  renderList();
}

function forwardSelectedRequest() {
  const request = state.requests.find((item) => item.id === state.selectedRequestId);
  if (!request || request.status === "Derivada al correo") return;
  request.status = "Derivada al correo";
  request.forwardedTo = DESTINATION_EMAIL;
  saveRequests();
  selectRequest(request.id);
  document.querySelector("#inbox-confirmation").textContent = `Simulación completada: ${request.name} quedó marcada como “Derivada al correo” para ${DESTINATION_EMAIL}. No se envió un correo real.`;
}

projectCards.forEach((card) => card.addEventListener("click", () => chooseProject(card.dataset.project)));
document.querySelector("#continue-button").addEventListener("click", goToForm);
document.querySelector("#change-project").addEventListener("click", () => {
  formStep.hidden = true;
  projectStep.hidden = false;
  setStep(1);
  projectCards.find((card) => card.dataset.project === state.selectedProject)?.focus();
});
formInputs.forEach((input) => input.addEventListener("input", () => {
  input.classList.remove("is-invalid");
  input.setAttribute("aria-invalid", "false");
  document.querySelector(`#${input.id}-error`).textContent = "";
  updateSummary();
}));
requestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateForm()) {
    document.querySelector(".is-invalid")?.focus();
    return;
  }
  const submit = document.querySelector("#submit-button");
  const status = document.querySelector("#form-status");
  submit.disabled = true;
  submit.textContent = "Registrando…";
  status.textContent = "Registrando solicitud en la bandeja local de demostración…";
  window.setTimeout(() => {
    const request = createRequest();
    state.requests.unshift(request);
    state.selectedRequestId = request.id;
    saveRequests();
    renderList();
    selectRequest(request.id);
    requestForm.reset();
    updateSummary();
    submit.disabled = false;
    submit.textContent = "Enviar solicitud →";
    status.textContent = "Solicitud recibida. Puede revisarla en la bandeja CRM a continuación.";
    document.querySelector("#inbox-confirmation").textContent = `Solicitud de demostración recibida para ${request.project}. Está disponible en la bandeja local con estado “Nueva”.`;
    document.querySelector("#bandeja").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 550);
});
document.querySelectorAll("#search-filter, #project-filter, #status-filter").forEach((filter) => filter.addEventListener("input", renderList));
document.querySelector("#forward-button").addEventListener("click", forwardSelectedRequest);

document.querySelector("#mail-target").textContent = DESTINATION_EMAIL;
renderList();
