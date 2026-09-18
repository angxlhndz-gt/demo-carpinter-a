import { createRequest, loadRequests, saveRequests } from "./app.js";

const state = { project: "" };
const cards = [...document.querySelectorAll("[data-project]")];
const formStep = document.querySelector("#form-step");
const form = document.querySelector("#request-form");
const inputs = [...form.querySelectorAll("input")];

function updateSummary() {
  document.querySelector('[data-summary="project"]').textContent = state.project || "—";
  inputs.forEach((input) => { document.querySelector(`[data-summary="${input.name}"]`).textContent = input.value.trim() || "Pendiente"; });
}

function selectProject(project) {
  state.project = project;
  cards.forEach((card) => {
    const selected = card.dataset.project === project;
    card.classList.toggle("is-selected", selected);
    card.setAttribute("aria-checked", String(selected));
  });
  document.querySelector("#project-error").hidden = true;
  document.querySelector("#selected-project-label").textContent = project;
  formStep.hidden = false;
  updateSummary();
  window.setTimeout(() => formStep.scrollIntoView({ behavior: "smooth", block: "nearest" }), 80);
}

function validate() {
  const messages = { name: "Indique su nombre.", zone: "Indique su zona.", nit: "Indique su NIT.", email: "Indique su correo electrónico." };
  let valid = Boolean(state.project);
  if (!state.project) document.querySelector("#project-error").hidden = false;
  inputs.forEach((input) => {
    let message = !input.value.trim() ? messages[input.name] : "";
    if (input.name === "email" && input.value.trim() && !input.validity.valid) message = "Ingrese un correo electrónico válido.";
    document.querySelector(`#${input.name}-error`).textContent = message;
    input.classList.toggle("is-invalid", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
    if (message) valid = false;
  });
  return valid;
}

cards.forEach((card) => card.addEventListener("click", () => selectProject(card.dataset.project)));
document.querySelector("#change-project").addEventListener("click", () => { cards.find((card) => card.dataset.project === state.project)?.focus(); });
inputs.forEach((input) => input.addEventListener("input", () => {
  input.classList.remove("is-invalid");
  input.setAttribute("aria-invalid", "false");
  document.querySelector(`#${input.name}-error`).textContent = "";
  updateSummary();
}));

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validate()) { document.querySelector(".is-invalid")?.focus(); return; }
  const submit = document.querySelector("#submit-button");
  submit.disabled = true;
  submit.textContent = "Registrando…";
  document.querySelector("#form-status").textContent = "Guardando la solicitud local de demostración…";
  window.setTimeout(() => {
    const fields = Object.fromEntries(new FormData(form));
    const request = createRequest(state.project, fields);
    const requests = loadRequests();
    requests.unshift(request);
    saveRequests(requests);
    document.querySelector("#receipt-copy").textContent = `${request.project} · ${request.name} · estado inicial: Nueva. Revísela en el panel interno de demostración.`;
    document.querySelector("#open-panel-link").href = `/reywood/panel/?request=${encodeURIComponent(request.id)}`;
    document.querySelector("#receipt-card").hidden = false;
    form.hidden = true;
    document.querySelector("#form-status").textContent = "Solicitud registrada localmente. No se envió un correo real.";
    submit.disabled = false;
    submit.textContent = "Registrar solicitud →";
    document.querySelector("#receipt-card").scrollIntoView({ behavior: "smooth", block: "center" });
  }, 420);
});

updateSummary();
