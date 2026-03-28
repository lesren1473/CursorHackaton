const STORAGE_KEY = "sport-court-appointments-v1";
const CHAT_KEY = "sport-court-chat-v1";
const USER_KEY = "sport-court-user-v1";
const DEMO_SEED_FLAG = "sport-court-demo-seed-v2";

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

/**
 * Jednokratno dodaje po dva demo-termina po lokaciji (s predpopunjenim prijavama).
 */
export function ensureDemoAppointments(locations, getSuggestedSportsForCourtType) {
  if (localStorage.getItem(DEMO_SEED_FLAG)) {
    return;
  }

  const list = loadAll();
  const existingIds = new Set(list.map((a) => a.id));
  const now = Date.now();

  for (const loc of locations) {
    for (let i = 0; i < 2; i++) {
      const id = `demo-${loc.objectId}-${i}`;
      if (existingIds.has(id)) {
        continue;
      }

      const sports = getSuggestedSportsForCourtType(loc.objectType);
      const sport = sports[i % sports.length] || sports[0] || "Nogomet";
      const daysAhead = 1 + (loc.objectId % 6) + i * 2;
      const start = new Date(now);
      start.setHours(18, 30 * i, 0, 0);
      start.setDate(start.getDate() + daysAhead);

      const shortAddr = String(loc.address ?? "igralište").slice(0, 32);
      const titles = ["Javni termin", "Vikend okupljanje"];
      const descs = [
        "Rekreativna razina, donesite vlastitu vodu. Mjesto na terminu osigurava prijava.",
        "Nakon prijave otvaramo chat grupe za dogovor oko opreme i dolaska."
      ];

      list.push(
        normalizeAppointment({
          id,
          locationObjectId: loc.objectId,
          title: `${titles[i]} — ${shortAddr}`.trim(),
          sportType: sport,
          minPlayers: i === 0 ? 4 : 6,
          maxPlayers: i === 0 ? 10 : 12,
          startIso: start.toISOString(),
          durationMinutes: i === 0 ? 90 : 60,
          description: descs[i],
          participants: [
            {
              userId: "demo-igrac-1",
              displayName: "Ivana K.",
              joinedAt: new Date(now - 86400000).toISOString()
            },
            {
              userId: "demo-igrac-2",
              displayName: "Marko P.",
              joinedAt: new Date(now - 7200000).toISOString()
            }
          ]
        })
      );
    }
  }

  saveAll(list);
  localStorage.setItem(DEMO_SEED_FLAG, "1");
}
