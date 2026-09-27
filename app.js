const STORAGE_KEYS = { settings: "osteofides.settings.v1", demo: "osteofides.events.v1" };
const DEMO_EVENTS = [
  { id:"evt-1001", case_id:"CASE-2026-018", procedure_name:"Total Knee Arthroplasty", occurred_at:"2026-09-27T14:32:00.000Z", event_type:"Restricted-zone proximity", severity:"High", system_action:"Motion paused", response_time_ms:84, outcome:"Successful intervention", status:"Resolved", notes:"Simulated instrument entry into a protected workspace." },
  { id:"evt-1002", case_id:"CASE-2026-018", procedure_name:"Total Knee Arthroplasty", occurred_at:"2026-09-27T14:35:00.000Z", event_type:"Instrument tracking loss", severity:"Medium", system_action:"Hold position; tracking reacquired", response_time_ms:126, outcome:"Successful intervention", status:"Resolved", notes:"Synthetic tracking interruption during approach." },
  { id:"evt-1003", case_id:"CASE-2026-017", procedure_name:"Total Hip Arthroplasty", occurred_at:"2026-09-26T18:14:00.000Z", event_type:"Trajectory deviation", severity:"High", system_action:"Trajectory rejected", response_time_ms:71, outcome:"Manual review required", status:"Active", notes:"Planned path exceeded a simulated tolerance envelope." },
  { id:"evt-1004", case_id:"CASE-2026-017", procedure_name:"Total Hip Arthroplasty", occurred_at:"2026-09-26T18:21:00.000Z", event_type:"Force threshold exceeded", severity:"Medium", system_action:"Motion paused; force rechecked", response_time_ms:93, outcome:"Successful intervention", status:"Resolved", notes:"Synthetic force-limit event." },
  { id:"evt-1005", case_id:"CASE-2026-016", procedure_name:"Shoulder Arthroplasty", occurred_at:"2026-09-25T15:02:00.000Z", event_type:"Workflow boundary warning", severity:"Low", system_action:"Warning displayed", response_time_ms:112, outcome:"Warning issued", status:"Resolved", notes:"Simulated workflow sequence reminder." },
  { id:"evt-1006", case_id:"CASE-2026-016", procedure_name:"Shoulder Arthroplasty", occurred_at:"2026-09-25T15:19:00.000Z", event_type:"Restricted-zone proximity", severity:"High", system_action:"Motion paused", response_time_ms:78, outcome:"Successful intervention", status:"Resolved", notes:"Synthetic boundary approach event." },
  { id:"evt-1007", case_id:"CASE-2026-015", procedure_name:"Total Knee Arthroplasty", occurred_at:"2026-09-24T19:42:00.000Z", event_type:"Unexpected motion detected", severity:"Low", system_action:"Motion dampened", response_time_ms:108, outcome:"Successful intervention", status:"Active", notes:"Demo record included to show active-event workflow." }
];

const state = { events: [], settings: null, busy: false, toastTimer: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function safeRead(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function safeWrite(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showToast("Could not save in this browser."); return false; } }
function isConnected() { return Boolean(state.settings?.url && state.settings?.key); }
function uuid() { return globalThis.crypto?.randomUUID?.() || `evt-${Date.now()}-${Math.random().toString(16).slice(2,8)}`; }

function seedDemoData() {
  let events = safeRead(STORAGE_KEYS.demo, null);
  if (!Array.isArray(events)) { events = structuredClone(DEMO_EVENTS); safeWrite(STORAGE_KEYS.demo, events); }
  return events;
}

async function supabaseRequest(path, { method = "GET", body, prefer } = {}) {
  const url = `${state.settings.url.replace(/\/$/, "")}/rest/v1/${path}`;
  const headers = { apikey: state.settings.key, Authorization: `Bearer ${state.settings.key}`, "Content-Type": "application/json" };
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!response.ok) {
    let detail = "";
    try { const parsed = await response.json(); detail = parsed.message || parsed.hint || ""; } catch {}
    throw new Error(detail || `Supabase returned ${response.status}. Check the table and row-level security policies.`);
  }
  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadEvents() {
  clearError();
  if (isConnected()) {
    setConnection("Connecting", "");
    try {
      state.events = await supabaseRequest("safety_events?select=*&order=occurred_at.desc");
      setConnection("Supabase connected", "connected");
    } catch (error) {
      setConnection("Connection issue", "error");
      showError(`Could not load Supabase records. ${error.message}`);
      state.events = [];
    }
  } else {
    state.events = seedDemoData();
    setConnection("Demo data", "");
  }
  render();
}

function setConnection(label, mode) {
  const pill = $("#connection-status");
  pill.className = `connection-pill ${mode || ""}`;
  pill.querySelector("span").textContent = label;
}
function showError(message) { const banner = $("#error-banner"); banner.textContent = message; banner.classList.remove("hidden"); }
function clearError() { $("#error-banner").classList.add("hidden"); }
function showToast(message) {
  const toast = $("#toast"); toast.textContent = message; toast.classList.add("visible");
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
}
function filteredEvents() {
  const query = $("#search-input").value.trim().toLowerCase();
  const severity = $("#severity-filter").value;
  const status = $("#status-filter").value;
  return [...state.events].filter((event) => {
    const matchesQuery = !query || [event.case_id, event.procedure_name, event.event_type, event.system_action, event.outcome].some((item) => String(item || "").toLowerCase().includes(query));
    return matchesQuery && (severity === "all" || event.severity === severity) && (status === "all" || event.status === status);
  }).sort((a, b) => new Date(b.occurred_at) - new Date(a.occurred_at));
}
function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "Time unavailable" : new Intl.DateTimeFormat(undefined, { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }).format(date);
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[character]));
}
function render() {
  const events = state.events;
  const resolved = events.filter((event) => event.status === "Resolved").length;
  const outcomeEvents = events.filter((event) => event.outcome);
  const successful = outcomeEvents.filter((event) => event.outcome === "Successful intervention").length;
  const cases = new Set(events.map((event) => event.case_id).filter(Boolean)).size;
  const rate = outcomeEvents.length ? Math.round(successful / outcomeEvents.length * 100) : 0;
  const resolvedRate = events.length ? Math.round(resolved / events.length * 100) : 0;
  $("#metric-cases").textContent = cases;
  $("#metric-events").textContent = events.length;
  $("#metric-high").textContent = events.filter((event) => event.severity === "High").length;
  $("#metric-success").textContent = `${rate}%`;
  $("#metric-open").textContent = events.filter((event) => event.status === "Active").length;
  $("#resolution-rate").textContent = `${resolvedRate}%`;
  $("#resolution-bar").style.width = `${resolvedRate}%`;
  $("#event-count").textContent = events.length;
  $("#nav-event-count").textContent = events.length;
  renderPatterns(events);
  const visibleEvents = filteredEvents();
  $("#result-count").textContent = `${visibleEvents.length} result${visibleEvents.length === 1 ? "" : "s"}`;
  $("#shown-count").textContent = visibleEvents.length;
  $("#empty-state").classList.toggle("hidden", visibleEvents.length > 0);
  $("table").classList.toggle("hidden", visibleEvents.length === 0);
  $("#event-rows").innerHTML = visibleEvents.map((event) => {
    const severity = String(event.severity || "Low").toLowerCase();
    const status = event.status === "Resolved" ? "resolved" : "active";
    const action = event.status === "Resolved" ? "Reopen" : "Resolve";
    return `<tr>
      <td><div class="case-id">${escapeHTML(event.case_id || "CASE—")}</div><div class="procedure-name">${escapeHTML(event.procedure_name || "Procedure unspecified")}</div></td>
      <td><div class="event-name" title="${escapeHTML(event.event_type)}">${escapeHTML(event.event_type || "Unspecified event")}</div><div class="event-date">${escapeHTML(formatDate(event.occurred_at))}</div></td>
      <td><span class="severity-badge severity-${escapeHTML(severity)}">${escapeHTML(event.severity || "Low")}</span></td>
      <td>${escapeHTML(event.system_action || "—")}${event.response_time_ms !== null && event.response_time_ms !== "" && event.response_time_ms !== undefined ? `<div class="event-date">${escapeHTML(event.response_time_ms)} ms</div>` : ""}</td>
      <td><span class="outcome-badge">${escapeHTML(event.outcome || "Not recorded")}</span></td>
      <td><span class="status-badge status-${status}">${escapeHTML(event.status || "Active")}</span></td>
      <td class="action-cell"><button class="row-action" data-action="edit" data-id="${escapeHTML(event.id)}">Edit</button><button class="row-action" data-action="toggle" data-id="${escapeHTML(event.id)}">${action}</button><button class="row-action delete" data-action="delete" data-id="${escapeHTML(event.id)}" aria-label="Delete event ${escapeHTML(event.case_id)}">Delete</button></td>
    </tr>`;
  }).join("");
}
function renderPatterns(events) {
  const groups = events.reduce((all, event) => { const key = event.event_type || "Unspecified"; all[key] = (all[key] || 0) + 1; return all; }, {});
  const top = Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, 4);
  if (!top.length) { $("#event-patterns").innerHTML = '<div class="no-patterns">Record events to see their distribution.</div>'; return; }
  const max = top[0][1];
  $("#event-patterns").innerHTML = top.map(([name, count]) => `<div class="bar-row"><span class="bar-label" title="${escapeHTML(name)}">${escapeHTML(name)}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.max(8, count / max * 100)}%"></span></span><span class="bar-count">${count}</span></div>`).join("");
}

function openModal(id) { const modal = $(`#${id}`); modal.classList.remove("hidden"); document.body.style.overflow = "hidden"; const focusable = modal.querySelector("input:not([type=hidden]),select,button"); focusable?.focus(); }
function closeModal(modal) { modal.classList.add("hidden"); if ($$(".modal-backdrop:not(.hidden)").length === 0) document.body.style.overflow = ""; }
function resetForm() { $("#event-form").reset(); $("#event-id").value = ""; $("#event-modal-title").textContent = "Record safety event"; $("#save-event").textContent = "Save event"; $("#form-error").classList.add("hidden"); }
function editEvent(id) {
  const event = state.events.find((item) => String(item.id) === id); if (!event) return;
  resetForm(); $("#event-modal-title").textContent = "Edit safety event"; $("#save-event").textContent = "Save changes"; $("#event-id").value = event.id;
  for (const key of ["case_id","procedure_name","event_type","severity","system_action","response_time_ms","outcome","status","notes"]) { const field = $(`#${key}`); if (field) field.value = event[key] ?? ""; }
  openModal("event-modal");
}
function collectForm() {
  const form = new FormData($("#event-form"));
  return { case_id: form.get("case_id").trim(), procedure_name: form.get("procedure_name"), event_type: form.get("event_type"), severity: form.get("severity"), system_action: form.get("system_action").trim(), response_time_ms: form.get("response_time_ms") === "" ? null : Number(form.get("response_time_ms")), outcome: form.get("outcome"), status: form.get("status"), notes: form.get("notes").trim() || null };
}
async function saveEvent(event) {
  event.preventDefault(); if (state.busy) return;
  const id = $("#event-id").value; const values = collectForm();
  const record = id ? values : { ...values, id: isConnected() ? undefined : uuid(), occurred_at: new Date().toISOString() };
  state.busy = true; $("#save-event").disabled = true; $("#save-event").textContent = "Saving…";
  try {
    if (isConnected()) {
      if (id) await supabaseRequest(`safety_events?id=eq.${encodeURIComponent(id)}`, { method:"PATCH", body:values, prefer:"return=minimal" });
      else { delete record.id; await supabaseRequest("safety_events", { method:"POST", body:record, prefer:"return=minimal" }); }
      await loadEvents();
    } else {
      if (id) state.events = state.events.map((item) => String(item.id) === id ? { ...item, ...record } : item);
      else state.events = [{ ...record }, ...state.events];
      safeWrite(STORAGE_KEYS.demo, state.events); render();
    }
    closeModal($("#event-modal")); resetForm(); showToast(id ? "Event updated." : "Event recorded.");
  } catch (error) { $("#form-error").textContent = error.message; $("#form-error").classList.remove("hidden"); }
  finally { state.busy = false; $("#save-event").disabled = false; $("#save-event").textContent = id ? "Save changes" : "Save event"; }
}
async function changeEvent(id, action) {
  const event = state.events.find((item) => String(item.id) === id); if (!event) return;
  if (action === "delete" && !window.confirm(`Delete event ${event.case_id} / ${event.event_type}? This cannot be undone.`)) return;
  const patch = action === "delete" ? null : { status: event.status === "Resolved" ? "Active" : "Resolved" };
  try {
    if (isConnected()) {
      if (action === "delete") await supabaseRequest(`safety_events?id=eq.${encodeURIComponent(id)}`, { method:"DELETE", prefer:"return=minimal" });
      else await supabaseRequest(`safety_events?id=eq.${encodeURIComponent(id)}`, { method:"PATCH", body:patch, prefer:"return=minimal" });
      await loadEvents();
    } else {
      state.events = action === "delete" ? state.events.filter((item) => String(item.id) !== id) : state.events.map((item) => String(item.id) === id ? { ...item, ...patch } : item);
      safeWrite(STORAGE_KEYS.demo, state.events); render();
    }
    showToast(action === "delete" ? "Event deleted." : `Event ${patch.status.toLowerCase()}.`);
  } catch (error) { showError(`Could not ${action === "delete" ? "delete" : "update"} event. ${error.message}`); }
}
function openSettings() {
  const settings = safeRead(STORAGE_KEYS.settings, {});
  $("#supabase-url").value = settings.url || ""; $("#supabase-key").value = settings.key || ""; $("#settings-error").classList.add("hidden"); openModal("settings-modal");
}
async function saveSettings(event) {
  event.preventDefault(); const url = $("#supabase-url").value.trim().replace(/\/$/, ""); const key = $("#supabase-key").value.trim();
  const error = $("#settings-error"); error.classList.add("hidden");
  if (!url || !key) { error.textContent = "Enter both the Supabase project URL and anon key."; error.classList.remove("hidden"); return; }
  try { const parsed = new URL(url); if (parsed.protocol !== "https:" || !parsed.hostname.endsWith("supabase.co")) throw new Error("Use the HTTPS URL for your Supabase project (https://….supabase.co)." ); }
  catch (cause) { error.textContent = cause.message || "Enter a valid Supabase project URL."; error.classList.remove("hidden"); return; }
  state.settings = { url, key }; safeWrite(STORAGE_KEYS.settings, state.settings); closeModal($("#settings-modal")); await loadEvents(); showToast("Supabase settings saved.");
}
async function useDemoMode() { state.settings = null; localStorage.removeItem(STORAGE_KEYS.settings); closeModal($("#settings-modal")); await loadEvents(); showToast("Using local demo data."); }
function exportCSV() {
  const rows = filteredEvents();
  if (!rows.length) { showToast("There are no visible events to export."); return; }
  const fields = ["case_id","procedure_name","occurred_at","event_type","severity","system_action","response_time_ms","outcome","status","notes"];
  const csv = [fields.join(","), ...rows.map((row) => fields.map((field) => `"${String(row[field] ?? "").replace(/"/g, '""')}"`).join(","))].join("\r\n");
  const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8" })); link.download = "osteofides-safety-events.csv"; link.click(); URL.revokeObjectURL(link.href); showToast("Filtered event log exported.");
}

function init() {
  state.settings = safeRead(STORAGE_KEYS.settings, null);
  $("#new-event").addEventListener("click", () => { resetForm(); openModal("event-modal"); });
  $("#empty-new-event").addEventListener("click", () => { resetForm(); openModal("event-modal"); });
  $("#open-settings").addEventListener("click", openSettings); $("#open-settings-top").addEventListener("click", openSettings);
  $("#event-form").addEventListener("submit", saveEvent); $("#settings-form").addEventListener("submit", saveSettings);
  $("#use-demo-mode").addEventListener("click", useDemoMode); $("#export-csv").addEventListener("click", exportCSV);
  for (const filter of ["#search-input","#severity-filter","#status-filter"]) $(filter).addEventListener("input", render);
  $("#event-rows").addEventListener("click", (event) => { const button = event.target.closest("button[data-action]"); if (!button) return; const { action, id } = button.dataset; if (action === "edit") editEvent(id); else changeEvent(id, action === "delete" ? "delete" : "toggle"); });
  $$("[data-close-modal]").forEach((button) => button.addEventListener("click", () => closeModal(button.closest(".modal-backdrop"))));
  $$(".modal-backdrop").forEach((backdrop) => backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeModal(backdrop); }));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") $$(".modal-backdrop:not(.hidden)").forEach(closeModal); });
  $("#dismiss-notice").addEventListener("click", () => $(".notice").classList.add("hidden"));
  loadEvents();
}
document.addEventListener("DOMContentLoaded", init);
