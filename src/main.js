import "leaflet/dist/leaflet.css";
import "./styles.css";

import { createMap } from "./map.js";
import {
  loadLocationsFromCsv,
  loadOverlayDatabase,
  mergeLocationsWithOverlayData
} from "./data.js";
import { getSuggestedSportsForCourtType } from "./courtSports.js";
import {
  addAppointment,
  addChatMessage,
  combineDateHourMinuteToIso,
  ensureDemoAppointments,
  formatAppointmentRange,
  formatDateTimeHr,
  getActiveAppointmentsForLocation,
  getAppointmentById,
  getChatMessages,
  getOrCreateUserProfile,
  joinAppointment,
  leaveAppointment,
  participantCount,
  saveUserDisplayName,
  userHasJoined
} from "./appointments.js";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="page page--map-fullscreen">
    <section class="map-shell">
      <header class="map-header">
        <button type="button" id="map-back-btn" class="map-back-link">← Natrag na Sportaj</button>
        <h1>Javna sportska igralista - Zagreb</h1>
        <p id="status" class="status">Učitavanje lokacija…</p>
      </header>
      <div class="map-stack">
        <div id="map" class="map"></div>
      </div>

      <aside id="pin-overlay" class="pin-overlay hidden" aria-live="polite">
        <div class="pin-overlay-inner">
          <button id="close-overlay" class="close-overlay" aria-label="Zatvori">×</button>
          <img id="overlay-image" alt="Prikaz igralista" />
          <h2 id="overlay-address"></h2>
          <p class="overlay-meta">
            <strong>Tip igralista:</strong>
            <span id="overlay-type"></span>
          </p>

          <section class="overlay-section" aria-labelledby="active-slots-heading">
            <h3 id="active-slots-heading" class="overlay-section-title">Aktivni termini</h3>
            <p class="hint-text">Klikni termin za detalje i prijavu.</p>
            <p id="appointments-empty" class="appointments-empty hidden">Nema aktivnih termina na ovom igralistu.</p>
            <ul id="appointments-list" class="appointments-list"></ul>
          </section>

          <section class="overlay-section" aria-labelledby="new-slot-heading">
            <h3 id="new-slot-heading" class="overlay-section-title">Novi termin</h3>
            <form id="new-appointment-form" class="appointment-form" novalidate>
              <label class="form-field">
                <span class="form-label">Naslov</span>
                <input type="text" name="title" required maxlength="120" placeholder="npr. Rekreativna utakmica" />
              </label>
              <label class="form-field">
                <span class="form-label">Tip sporta</span>
                <span class="form-hint">Predlošci ovise o tipu igrališta; možeš i sam upisati.</span>
                <input
                  type="text"
                  name="sportType"
                  required
                  maxlength="80"
                  id="sport-type-input"
                  list="sport-suggestions"
                  placeholder="Odaberi s popisa ili upiši"
                />
                <datalist id="sport-suggestions"></datalist>
              </label>
              <div class="form-row">
                <label class="form-field">
                  <span class="form-label">Min. igrača</span>
                  <input type="number" name="minPlayers" required min="1" max="999" value="4" />
                </label>
                <label class="form-field">
                  <span class="form-label">Max. igrača</span>
                  <input type="number" name="maxPlayers" required min="1" max="999" value="10" />
                </label>
              </div>
              <div class="form-row form-row--datetime">
                <label class="form-field">
                  <span class="form-label">Datum početka</span>
                  <input type="date" name="startDate" required />
                </label>
                <div class="form-field">
                  <span class="form-label">Vrijeme (24 h, sati 0–23)</span>
                  <div class="time-24h" role="group" aria-label="Vrijeme u 24-satnom obliku">
                    <input
                      type="number"
                      name="startHour"
                      required
                      min="0"
                      max="23"
                      step="1"
                      inputmode="numeric"
                      class="time-24h-hour"
                      aria-label="Sati"
                    />
                    <span class="time-24h-sep" aria-hidden="true">:</span>
                    <input
                      type="number"
                      name="startMinute"
                      required
                      min="0"
                      max="59"
                      step="1"
                      inputmode="numeric"
                      class="time-24h-minute"
                      aria-label="Minute"
                    />
                  </div>
                </div>
              </div>
              <label class="form-field">
                <span class="form-label">Trajanje (minute)</span>
                <input type="number" name="durationMinutes" required min="15" max="720" step="5" value="60" />
              </label>
              <label class="form-field">
                <span class="form-label">Opis</span>
                <textarea name="description" rows="3" maxlength="2000" placeholder="Razina igre, oprema, napomene…"></textarea>
              </label>
              <p id="form-error" class="form-error hidden" role="alert"></p>
              <button type="submit" class="btn-primary">Kreiraj termin</button>
            </form>
          </section>
        </div>
      </aside>
    </section>

    <div id="detail-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="detail-modal-title">
      <div class="modal-backdrop" data-close="detail"></div>
      <div class="modal-panel">
        <button type="button" class="modal-close" data-close="detail" aria-label="Zatvori">×</button>
        <h2 id="detail-modal-title" class="modal-title"></h2>
        <dl class="detail-dl">
          <div><dt>Tip sporta</dt><dd id="detail-sport"></dd></div>
          <div><dt>Raspored</dt><dd id="detail-range"></dd></div>
          <div><dt>Trajanje</dt><dd id="detail-duration"></dd></div>
          <div><dt>Igrači</dt><dd id="detail-players"></dd></div>
          <div><dt>Prijave</dt><dd id="detail-joined-summary"></dd></div>
        </dl>
        <section class="detail-block">
          <h3 class="detail-subtitle">Opis</h3>
          <p id="detail-description" class="detail-description"></p>
        </section>
        <section class="detail-block">
          <h3 class="detail-subtitle">Prijavljeni</h3>
          <ul id="detail-participant-list" class="participant-list"></ul>
        </section>
        <p id="detail-error" class="form-error hidden" role="alert"></p>
        <p id="detail-full-note" class="detail-full-note hidden">Termin je popunjen.</p>
        <div id="detail-join-wrap" class="detail-actions hidden">
          <label class="form-field">
            <span class="form-label">Ime za prikaz</span>
            <input type="text" id="join-display-name" maxlength="80" placeholder="npr. Ana" />
          </label>
          <button type="button" id="btn-join-appointment" class="btn-primary">Pridruži se terminu</button>
        </div>
        <div id="detail-joined-actions" class="detail-actions hidden">
          <p class="joined-note">Prijavljen si na ovaj termin.</p>
          <button type="button" id="btn-open-chat" class="btn-secondary">Otvori chat</button>
          <button type="button" id="btn-leave-appointment" class="btn-secondary">Odjavi se</button>
        </div>
      </div>
    </div>

    <div id="chat-modal" class="modal hidden" role="dialog" aria-modal="true" aria-labelledby="chat-modal-title">
      <div class="modal-backdrop" data-close="chat"></div>
      <div class="modal-panel modal-panel--chat">
        <div class="chat-modal-head">
          <button type="button" id="chat-back-btn" class="chat-back-btn" aria-label="Natrag na opis termina">←</button>
          <div class="chat-modal-head-text">
            <h2 id="chat-modal-title" class="modal-title">Chat termina</h2>
            <p id="chat-subtitle" class="chat-subtitle"></p>
          </div>
          <button type="button" class="modal-close" data-close="chat" aria-label="Zatvori">×</button>
        </div>
        <div id="chat-messages" class="chat-messages" aria-live="polite"></div>
        <form id="chat-form" class="chat-form">
          <input type="text" id="chat-input" maxlength="2000" placeholder="Poruka…" autocomplete="off" />
          <button type="submit" class="btn-primary">Pošalji</button>
        </form>
      </div>
    </div>
  </main>
`;

document.documentElement.classList.add("legacy-map-page");

function mapHomeUrl() {
  const base = import.meta.env.BASE_URL || "/";
  if (base === "/") return "/";
  return base.endsWith("/") ? base : `${base}/`;
}

document.querySelector("#map-back-btn")?.addEventListener("click", () => {
  window.location.assign(mapHomeUrl());
});

const statusElement = document.querySelector("#status");
const overlayElement = document.querySelector("#pin-overlay");
const closeOverlayButton = document.querySelector("#close-overlay");
const overlayImage = document.querySelector("#overlay-image");
const overlayAddress = document.querySelector("#overlay-address");
const overlayType = document.querySelector("#overlay-type");
const appointmentsList = document.querySelector("#appointments-list");
const appointmentsEmpty = document.querySelector("#appointments-empty");
const newAppointmentForm = document.querySelector("#new-appointment-form");
const formError = document.querySelector("#form-error");
const sportSuggestions = document.querySelector("#sport-suggestions");

const detailModal = document.querySelector("#detail-modal");
const detailTitle = document.querySelector("#detail-modal-title");
const detailSport = document.querySelector("#detail-sport");
const detailRange = document.querySelector("#detail-range");
const detailDuration = document.querySelector("#detail-duration");
const detailPlayers = document.querySelector("#detail-players");
const detailJoinedSummary = document.querySelector("#detail-joined-summary");
const detailDescription = document.querySelector("#detail-description");
const detailParticipantList = document.querySelector("#detail-participant-list");
const detailError = document.querySelector("#detail-error");
const detailFullNote = document.querySelector("#detail-full-note");
const detailJoinWrap = document.querySelector("#detail-join-wrap");
const detailJoinedActions = document.querySelector("#detail-joined-actions");
const joinDisplayNameInput = document.querySelector("#join-display-name");
const btnJoinAppointment = document.querySelector("#btn-join-appointment");
const btnOpenChat = document.querySelector("#btn-open-chat");
const btnLeaveAppointment = document.querySelector("#btn-leave-appointment");

const chatModal = document.querySelector("#chat-modal");
const chatBackBtn = document.querySelector("#chat-back-btn");
const chatSubtitle = document.querySelector("#chat-subtitle");
const chatMessages = document.querySelector("#chat-messages");
const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");

let selectedLocationObjectId = null;
let selectedCourtObjectType = "";
let selectedAppointmentId = null;
let cachedLocations = [];

function closeOverlay() {
  overlayElement.classList.add("hidden");
  selectedLocationObjectId = null;
  selectedCourtObjectType = "";
  formError.classList.add("hidden");
  formError.textContent = "";
}

function fillSportDatalist(objectType) {
  sportSuggestions.replaceChildren();
  for (const sport of getSuggestedSportsForCourtType(objectType)) {
    const opt = document.createElement("option");
    opt.value = sport;
    sportSuggestions.append(opt);
  }
}

function setDefaultStartFields() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, "0");
  const dateEl = newAppointmentForm.querySelector('[name="startDate"]');
  const hourEl = newAppointmentForm.querySelector('[name="startHour"]');
  const minuteEl = newAppointmentForm.querySelector('[name="startMinute"]');
  if (dateEl) {
    dateEl.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  if (hourEl) {
    hourEl.value = String(d.getHours());
  }
  if (minuteEl) {
    minuteEl.value = String(d.getMinutes());
  }
}

function renderAppointmentsForLocation(locationObjectId) {
  appointmentsList.replaceChildren();
  const items = getActiveAppointmentsForLocation(locationObjectId);

  if (items.length === 0) {
    appointmentsEmpty.classList.remove("hidden");
    return;
  }

  appointmentsEmpty.classList.add("hidden");

  for (const a of items) {
    const li = document.createElement("li");
    li.className = "appointment-item appointment-item--clickable";
    li.tabIndex = 0;
    li.dataset.appointmentId = a.id;
    li.setAttribute("role", "button");
    li.setAttribute(
      "aria-label",
      `Termin: ${a.title}, ${formatAppointmentRange(a)}`
    );

    const title = document.createElement("strong");
    title.className = "appointment-item-title";
    title.textContent = a.title;

    const meta = document.createElement("p");
    meta.className = "appointment-item-meta";
    const n = participantCount(a);
    meta.textContent = `${a.sportType} · ${n}/${a.maxPlayers} prijava · min. ${a.minPlayers}`;

    const time = document.createElement("p");
    time.className = "appointment-item-time";
    time.textContent = formatAppointmentRange(a);

    li.append(title, meta, time);
    appointmentsList.append(li);
  }
}

function bindAppointmentListClicks() {
  appointmentsList.addEventListener("click", (e) => {
    const item = e.target.closest(".appointment-item--clickable");
    if (!item?.dataset.appointmentId) {
      return;
    }
    openDetailModal(item.dataset.appointmentId);
  });

  appointmentsList.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") {
      return;
    }
    const item = e.target.closest(".appointment-item--clickable");
    if (!item?.dataset.appointmentId) {
      return;
    }
    e.preventDefault();
    openDetailModal(item.dataset.appointmentId);
  });
}

function openOverlay(location) {
  selectedLocationObjectId = location.objectId;
  selectedCourtObjectType = location.objectType || "";

  overlayImage.onerror = () => {
    overlayImage.onerror = null;
    if (location.fallbackImageUrl) {
      overlayImage.src = location.fallbackImageUrl;
    }
  };
  overlayImage.src = location.imageUrl;
  overlayAddress.textContent = location.address || "Adresa nije dostupna";
  overlayType.textContent = location.objectType || "Nije navedeno";

  fillSportDatalist(selectedCourtObjectType);

  newAppointmentForm.reset();
  const durationInput = newAppointmentForm.querySelector('[name="durationMinutes"]');
  if (durationInput) {
    durationInput.value = "60";
  }
  const minInput = newAppointmentForm.querySelector('[name="minPlayers"]');
  const maxInput = newAppointmentForm.querySelector('[name="maxPlayers"]');
  if (minInput) {
    minInput.value = "4";
  }
  if (maxInput) {
    maxInput.value = "10";
  }
  const sportInput = newAppointmentForm.querySelector("#sport-type-input");
  const suggested = getSuggestedSportsForCourtType(selectedCourtObjectType);
  if (sportInput && suggested[0]) {
    sportInput.value = suggested[0];
  }
  setDefaultStartFields();

  formError.classList.add("hidden");
  formError.textContent = "";

  renderAppointmentsForLocation(location.objectId);
  overlayElement.classList.remove("hidden");
}

function closeDetailModal() {
  detailModal.classList.add("hidden");
  selectedAppointmentId = null;
  detailError.classList.add("hidden");
  detailError.textContent = "";
}

function closeChatModal() {
  chatModal.classList.add("hidden");
  chatInput.value = "";
  if (selectedAppointmentId) {
    openDetailModal(selectedAppointmentId);
  }
}

function openDetailModal(appointmentId) {
  const a = getAppointmentById(appointmentId);
  if (!a) {
    return;
  }

  selectedAppointmentId = appointmentId;
  detailError.classList.add("hidden");
  detailError.textContent = "";

  detailTitle.textContent = a.title;
  detailSport.textContent = a.sportType;
  detailRange.textContent = formatAppointmentRange(a);
  detailDuration.textContent = `${a.durationMinutes} min`;
  detailPlayers.textContent = `min. ${a.minPlayers}, max. ${a.maxPlayers}`;
  const n = participantCount(a);
  detailJoinedSummary.textContent = `${n} od ${a.maxPlayers} prijavljenih`;

  const desc = String(a.description ?? "").trim();
  detailDescription.textContent = desc.length > 0 ? desc : "Nema opisa.";

  detailParticipantList.replaceChildren();
  const parts = Array.isArray(a.participants) ? a.participants : [];
  if (parts.length === 0) {
    const li = document.createElement("li");
    li.className = "participant-empty";
    li.textContent = "Još nitko nije prijavljen.";
    detailParticipantList.append(li);
  } else {
    for (const p of parts) {
      const li = document.createElement("li");
      li.textContent = `${p.displayName} · ${formatDateTimeHr(p.joinedAt)}`;
      detailParticipantList.append(li);
    }
  }

  const profile = getOrCreateUserProfile();
  if (profile.displayName) {
    joinDisplayNameInput.value = profile.displayName;
  } else {
    joinDisplayNameInput.value = "";
  }

  const joined = userHasJoined(a, profile.userId);
  const full = n >= a.maxPlayers;

  detailFullNote.classList.toggle("hidden", !full || joined);
  detailJoinWrap.classList.toggle("hidden", joined || full);
  if (joined) {
    detailJoinedActions.classList.remove("hidden");
  } else {
    detailJoinedActions.classList.add("hidden");
  }

  detailModal.classList.remove("hidden");
}

function renderChatMessages(appointmentId) {
  chatMessages.replaceChildren();
  const list = getChatMessages(appointmentId);
  if (list.length === 0) {
    const p = document.createElement("p");
    p.className = "chat-empty";
    p.textContent = "Još nema poruka. Budi prvi koji će napisati.";
    chatMessages.append(p);
    return;
  }
  for (const m of list) {
    const div = document.createElement("div");
    div.className = "chat-bubble";
    const head = document.createElement("div");
    head.className = "chat-bubble-head";
    head.textContent = `${m.author} · ${formatDateTimeHr(m.at)}`;
    const body = document.createElement("div");
    body.className = "chat-bubble-text";
    body.textContent = m.text;
    div.append(head, body);
    chatMessages.append(div);
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function openChatModal(appointmentId) {
  const a = getAppointmentById(appointmentId);
  if (!a) {
    return;
  }
  const profile = getOrCreateUserProfile();
  if (!userHasJoined(a, profile.userId)) {
    return;
  }
  selectedAppointmentId = appointmentId;
  chatSubtitle.textContent = a.title;
  renderChatMessages(appointmentId);
  detailModal.classList.add("hidden");
  chatModal.classList.remove("hidden");
  chatInput.focus();
}

closeOverlayButton.addEventListener("click", closeOverlay);

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }
  if (!chatModal.classList.contains("hidden")) {
    closeChatModal();
    return;
  }
  if (!detailModal.classList.contains("hidden")) {
    closeDetailModal();
    return;
  }
  closeOverlay();
});

overlayElement.addEventListener("click", (event) => {
  if (event.target === overlayElement) {
    closeOverlay();
  }
});

detailModal.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "detail") {
    closeDetailModal();
  }
});

chatModal.addEventListener("click", (e) => {
  const t = e.target;
  if (t?.dataset?.close === "chat") {
    closeChatModal();
  }
});

btnJoinAppointment.addEventListener("click", () => {
  if (!selectedAppointmentId) {
    return;
  }
  detailError.classList.add("hidden");
  const name = joinDisplayNameInput.value.trim();
  const profile = getOrCreateUserProfile();
  const result = joinAppointment(selectedAppointmentId, profile.userId, name);
  if (!result.ok) {
    detailError.textContent = result.error;
    detailError.classList.remove("hidden");
    return;
  }
  saveUserDisplayName(name);
  const apptId = selectedAppointmentId;
  if (selectedLocationObjectId != null) {
    renderAppointmentsForLocation(selectedLocationObjectId);
  }
  openChatModal(apptId);
});

btnOpenChat.addEventListener("click", () => {
  if (!selectedAppointmentId) {
    return;
  }
  openChatModal(selectedAppointmentId);
});

btnLeaveAppointment.addEventListener("click", () => {
  if (!selectedAppointmentId) {
    return;
  }
  const profile = getOrCreateUserProfile();
  const result = leaveAppointment(selectedAppointmentId, profile.userId);
  if (!result.ok) {
    return;
  }
  if (selectedLocationObjectId != null) {
    renderAppointmentsForLocation(selectedLocationObjectId);
  }
  closeDetailModal();
});

chatBackBtn.addEventListener("click", () => {
  closeChatModal();
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!selectedAppointmentId) {
    return;
  }
  const appt = getAppointmentById(selectedAppointmentId);
  const profile = getOrCreateUserProfile();
  if (!appt || !userHasJoined(appt, profile.userId)) {
    return;
  }
  const name =
    profile.displayName.trim() ||
    joinDisplayNameInput.value.trim() ||
    "Korisnik";
  const text = chatInput.value;
  addChatMessage(selectedAppointmentId, name, text);
  chatInput.value = "";
  renderChatMessages(selectedAppointmentId);
});

newAppointmentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formError.classList.add("hidden");
  formError.textContent = "";

  if (selectedLocationObjectId == null) {
    return;
  }

  const fd = new FormData(newAppointmentForm);
  const title = String(fd.get("title") ?? "").trim();
  const sportType = String(fd.get("sportType") ?? "").trim();
  const minPlayers = Number.parseInt(String(fd.get("minPlayers")), 10);
  const maxPlayers = Number.parseInt(String(fd.get("maxPlayers")), 10);
  const startDate = String(fd.get("startDate") ?? "").trim();
  const startHour = fd.get("startHour");
  const startMinute = fd.get("startMinute");
  const durationMinutes = Number.parseInt(String(fd.get("durationMinutes")), 10);
  const description = String(fd.get("description") ?? "").trim();

  if (
    !title ||
    !sportType ||
    !startDate ||
    String(startHour ?? "").trim() === "" ||
    String(startMinute ?? "").trim() === ""
  ) {
    formError.textContent = "Popuni obavezna polja.";
    formError.classList.remove("hidden");
    return;
  }

  if (!Number.isFinite(minPlayers) || !Number.isFinite(maxPlayers)) {
    formError.textContent = "Broj igrača mora biti valjan.";
    formError.classList.remove("hidden");
    return;
  }

  if (minPlayers < 1 || maxPlayers < 1) {
    formError.textContent = "Min. i max. igrača moraju biti najmanje 1.";
    formError.classList.remove("hidden");
    return;
  }

  if (minPlayers > maxPlayers) {
    formError.textContent = "Min. igrača ne smije biti veći od max. igrača.";
    formError.classList.remove("hidden");
    return;
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
    formError.textContent = "Trajanje mora biti najmanje 15 minuta.";
    formError.classList.remove("hidden");
    return;
  }

  const startIso = combineDateHourMinuteToIso(startDate, startHour, startMinute);
  if (!startIso) {
    formError.textContent =
      "Datum i vrijeme nisu valjani. Sati moraju biti 0–23, minute 0–59.";
    formError.classList.remove("hidden");
    return;
  }

  addAppointment({
    locationObjectId: selectedLocationObjectId,
    title,
    sportType,
    minPlayers,
    maxPlayers,
    startIso,
    durationMinutes,
    description
  });

  newAppointmentForm.reset();
  fillSportDatalist(selectedCourtObjectType);
  const sportInput = newAppointmentForm.querySelector("#sport-type-input");
  const suggested = getSuggestedSportsForCourtType(selectedCourtObjectType);
  if (sportInput && suggested[0]) {
    sportInput.value = suggested[0];
  }
  const minEl = newAppointmentForm.querySelector('[name="minPlayers"]');
  const maxEl = newAppointmentForm.querySelector('[name="maxPlayers"]');
  const durEl = newAppointmentForm.querySelector('[name="durationMinutes"]');
  if (minEl) {
    minEl.value = "4";
  }
  if (maxEl) {
    maxEl.value = "10";
  }
  if (durEl) {
    durEl.value = "60";
  }
  setDefaultStartFields();

  renderAppointmentsForLocation(selectedLocationObjectId);
});

bindAppointmentListClicks();

async function bootstrap() {
  try {
    const [locations, overlays] = await Promise.all([
      loadLocationsFromCsv(),
      loadOverlayDatabase()
    ]);
    const mappedLocations = mergeLocationsWithOverlayData(locations, overlays);

    ensureDemoAppointments(mappedLocations, getSuggestedSportsForCourtType);

    cachedLocations = mappedLocations;

    const leafletMap = createMap("map", mappedLocations, openOverlay);
    statusElement.textContent = `Učitano lokacija: ${mappedLocations.length}`;
    requestAnimationFrame(() => {
      leafletMap.invalidateSize();
    });
    setTimeout(() => leafletMap.invalidateSize(), 200);
  } catch (error) {
    statusElement.textContent =
      "Dogodila se greška pri učitavanju podataka. Provjeri format CSV datoteke.";
    console.error(error);
  }
}

bootstrap();
