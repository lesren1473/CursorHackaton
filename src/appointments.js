const STORAGE_KEY = "sport-court-appointments-v1";
const CHAT_KEY = "sport-court-chat-v1";
const USER_KEY = "sport-court-user-v1";
const DEMO_SEED_FLAG = "sport-court-demo-seed-v3";

const HR_LOCALE = "hr-HR";

const dateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
};

function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map(normalizeAppointment);
  } catch {
    return [];
  }
}

function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function normalizeAppointment(a) {
  const row = { ...a };
  if (!Array.isArray(row.participants)) {
    row.participants = [];
  }
  return row;
}

function endDate(appointment) {
  const start = new Date(appointment.startIso);
  return new Date(start.getTime() + appointment.durationMinutes * 60_000);
}

export function getActiveAppointmentsForLocation(locationObjectId, now = new Date()) {
  return loadAll()
    .filter((a) => a.locationObjectId === locationObjectId)
    .filter((a) => endDate(a) > now)
    .sort((a, b) => new Date(a.startIso) - new Date(b.startIso));
}

export function getAppointmentById(id) {
  return loadAll().find((a) => a.id === id) ?? null;
}

export function addAppointment(payload) {
  const list = loadAll();
  const row = normalizeAppointment({
    id: crypto.randomUUID(),
    locationObjectId: payload.locationObjectId,
    title: payload.title,
    sportType: payload.sportType,
    minPlayers: payload.minPlayers,
    maxPlayers: payload.maxPlayers,
    startIso: payload.startIso,
    durationMinutes: payload.durationMinutes,
    description: payload.description,
    participants: []
  });
  list.push(row);
  saveAll(list);
  return row;
}

export function formatAppointmentRange(appointment, locale = HR_LOCALE) {
  const start = new Date(appointment.startIso);
  const end = endDate(appointment);
  const a = start.toLocaleString(locale, dateTimeFormatOptions);
  const b = end.toLocaleString(locale, dateTimeFormatOptions);
  return `${a} – ${b}`;
}

export function formatDateTimeHr(isoString, locale = HR_LOCALE) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString(locale, dateTimeFormatOptions);
}

/** Lokalni datum + sati 0–23 + minute → ISO (za obrazac bez 12h/AM-PM). */
export function combineDateHourMinuteToIso(dateStr, hourRaw, minuteRaw) {
  if (!dateStr) {
    return null;
  }
  const hour = Number.parseInt(String(hourRaw), 10);
  const minute = Number.parseInt(String(minuteRaw), 10);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return null;
  }
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  const pad = (n) => String(n).padStart(2, "0");
  const d = new Date(`${dateStr}T${pad(hour)}:${pad(minute)}:00`);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

export function getOrCreateUserProfile() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && typeof p.userId === "string" && typeof p.displayName === "string") {
        return p;
      }
    }
  } catch {
    /* prazno */
  }
  const profile = {
    userId: crypto.randomUUID(),
    displayName: ""
  };
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
  return profile;
}

export function saveUserDisplayName(displayName) {
  const name = String(displayName ?? "").trim();
  const profile = getOrCreateUserProfile();
  profile.displayName = name;
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
  return profile;
}

export function participantCount(appointment) {
  return Array.isArray(appointment.participants) ? appointment.participants.length : 0;
}

export function userHasJoined(appointment, userId) {
  if (!userId || !appointment?.participants) {
    return false;
  }
  return appointment.participants.some((p) => p.userId === userId);
}

export function joinAppointment(appointmentId, userId, displayName) {
  const name = String(displayName ?? "").trim();
  if (!name) {
    return { ok: false, error: "Upiši ime za prikaz." };
  }

  const list = loadAll();
  const idx = list.findIndex((a) => a.id === appointmentId);
  if (idx === -1) {
    return { ok: false, error: "Termin nije pronađen." };
  }

  const a = list[idx];
  const participants = Array.isArray(a.participants) ? [...a.participants] : [];

  if (participants.some((p) => p.userId === userId)) {
    return { ok: false, error: "Već si prijavljen na ovaj termin." };
  }

  if (participants.length >= a.maxPlayers) {
    return { ok: false, error: "Termin je popunjen." };
  }

  participants.push({
    userId,
    displayName: name,
    joinedAt: new Date().toISOString()
  });

  list[idx] = { ...a, participants };
  saveAll(list);
  return { ok: true };
}

export function leaveAppointment(appointmentId, userId) {
  if (!userId) {
    return { ok: false, error: "Nema korisničkog profila." };
  }
  const list = loadAll();
  const idx = list.findIndex((a) => a.id === appointmentId);
  if (idx === -1) {
    return { ok: false, error: "Termin nije pronađen." };
  }
  const a = list[idx];
  const before = Array.isArray(a.participants) ? a.participants : [];
  const participants = before.filter((p) => p.userId !== userId);
  if (participants.length === before.length) {
    return { ok: false, error: "Nisi prijavljen na ovaj termin." };
  }
  list[idx] = { ...a, participants };
  saveAll(list);
  return { ok: true };
}

function loadChatMap() {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) {
      return {};
    }
    const o = JSON.parse(raw);
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

function saveChatMap(map) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(map));
}

export function getChatMessages(appointmentId) {
  const map = loadChatMap();
  const list = map[appointmentId];
  return Array.isArray(list) ? list : [];
}

/** Nadolazeći termini (počinju u budućnosti, unutar sljedećih maxHoursAhead h), sortirano po vremenu. */
export function getUpcomingAppointmentsSoon(now = new Date(), limit = 6, maxHoursAhead = 72) {
  const horizon = new Date(now.getTime() + maxHoursAhead * 60 * 60 * 1000);
  return loadAll()
    .filter((a) => {
      const start = new Date(a.startIso);
      const endA = endDate(a);
      return (
        !Number.isNaN(start.getTime()) &&
        endA > now &&
        start >= now &&
        start <= horizon
      );
    })
    .sort((a, b) => new Date(a.startIso) - new Date(b.startIso))
    .slice(0, limit);
}

export function addChatMessage(appointmentId, author, text) {
  const body = String(text ?? "").trim();
  const who = String(author ?? "").trim();
  if (!body || !who) {
    return null;
  }

  const map = loadChatMap();
  const list = Array.isArray(map[appointmentId]) ? [...map[appointmentId]] : [];
  const msg = {
    id: crypto.randomUUID(),
    author: who,
    text: body,
    at: new Date().toISOString()
  };
  list.push(msg);
  map[appointmentId] = list;
  saveChatMap(map);
  return msg;
}

function mix32(x) {
  let v = x | 0;
  v ^= v >>> 16;
  v = Math.imul(v, 0x7feb352d);
  v ^= v >>> 15;
  v = Math.imul(v, 0x846ca68b);
  v ^= v >>> 16;
  return v >>> 0;
}

/** Deterministički [0, 1) za seed + salt (nasumičnost između lokacija/slotova). */
function unit(seed, salt) {
  return mix32(seed + salt * 0x9e3779b9) / 0x1_0000_0000;
}

const DEMO_NAME_POOL = [
  "Ana H.",
  "Marko K.",
  "Petra N.",
  "Ivan B.",
  "Lucija M.",
  "Tomislav V.",
  "Maja R.",
  "Luka S.",
  "Dora P.",
  "Karlo T.",
  "Elena Z.",
  "Nikola J."
];

const DEMO_TITLE_A = [
  "Javni termin",
  "Rekreativni meč",
  "Vikend okupljanje",
  "Brzi turnir",
  "Lagana igra",
  "Otvoreni trening"
];

const DEMO_TITLE_B = [
  "donesi loptu",
  "svi dobrodošli",
  "fair play",
  "nakon posla",
  "jutarnji slot",
  "večernji termin"
];

/**
 * Jednokratno (po verziji zastavice) dodaje po dva demo-termina po lokaciji
 * s nasumičnim vremenom, trajanjem, kapacitetom i brojem prijava.
 */
export function ensureDemoAppointments(locations, getSuggestedSportsForCourtType) {
  if (localStorage.getItem(DEMO_SEED_FLAG) === "1") {
    return;
  }

  let list = loadAll().filter((a) => !String(a?.id ?? "").startsWith("demo-"));
  localStorage.removeItem("sport-court-demo-seed-v2");

  const nowMs = Date.now();

  for (const loc of locations) {
    for (let i = 0; i < 2; i++) {
      const id = `demo-v3-${loc.objectId}-${i}`;
      const seed = mix32(loc.objectId * 1_031 + i * 5_027);

      const sports = getSuggestedSportsForCourtType(loc.objectType);
      const sport =
        sports[Math.floor(unit(seed, 1) * sports.length)] || sports[0] || "Nogomet";

      const minPlayers = 2 + Math.floor(unit(seed, 2) * 6);
      let maxPlayers = minPlayers + 2 + Math.floor(unit(seed, 3) * 10);
      maxPlayers = Math.min(24, Math.max(minPlayers + 1, maxPlayers));

      const durations = [45, 60, 75, 90, 105, 120];
      const durationMinutes =
        durations[Math.floor(unit(seed, 4) * durations.length)] ?? 60;

      const hoursAhead = Math.pow(unit(seed, 5), 0.65) * 72;
      const start = new Date(nowMs + hoursAhead * 3600000);
      start.setSeconds(0, 0);
      const roundedMin = Math.floor(start.getMinutes() / 15) * 15;
      start.setMinutes(roundedMin, 0, 0);

      const nJoined = Math.min(
        maxPlayers,
        Math.floor(unit(seed, 7) * (maxPlayers + 1))
      );
      const participants = [];
      for (let p = 0; p < nJoined; p++) {
        const ni = Math.floor(unit(seed, 20 + p) * DEMO_NAME_POOL.length);
        participants.push({
          userId: `demo-npc-${loc.objectId}-${i}-${p}`,
          displayName: DEMO_NAME_POOL[ni] ?? `Igrač ${p + 1}`,
          joinedAt: new Date(nowMs - (p + 1) * 3_600_000).toISOString()
        });
      }

      const shortAddr = String(loc.address ?? "igralište").slice(0, 28);
      const ta = DEMO_TITLE_A[Math.floor(unit(seed, 8) * DEMO_TITLE_A.length)];
      const tb = DEMO_TITLE_B[Math.floor(unit(seed, 9) * DEMO_TITLE_B.length)];
      const descs = [
        "Rekreativna razina; donesi vodu. Chat nakon prijave.",
        "Dogovor oko opreme u chatu nakon što se pridružiš.",
        "Fair play, rotacija ako bude gužva.",
        "Početnici i srednja razina — javi se u chatu.",
        "Trajanje i broj igrača po dogovoru u grupi."
      ];
      const desc = descs[Math.floor(unit(seed, 11) * descs.length)];

      list.push(
        normalizeAppointment({
          id,
          locationObjectId: loc.objectId,
          title: `${ta} — ${shortAddr} (${tb})`.trim(),
          sportType: sport,
          minPlayers,
          maxPlayers,
          startIso: start.toISOString(),
          durationMinutes,
          description: desc,
          participants
        })
      );
    }
  }

  saveAll(list);
  localStorage.setItem(DEMO_SEED_FLAG, "1");
}
