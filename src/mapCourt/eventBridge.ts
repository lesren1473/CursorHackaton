import {
  ensureDemoAppointments,
  getAppointmentById,
  getChatMessages,
  getUpcomingAppointmentsSoon,
} from '../appointments.js';
import {
  loadLocationsFromCsv,
  loadOverlayDatabase,
  mergeLocationsWithOverlayData,
} from '../data.js';
import { getSuggestedSportsForCourtType } from '../courtSports.js';
import type { ChatMessage, Event, Organizer, SkillLevel, Sport } from '../types';

const ZAGREB_REF = { lat: 45.815, lng: 15.9819 };

export type MergedLocation = {
  objectId: number;
  lat: number;
  lng: number;
  address: string;
  objectType: string;
  imageUrl?: string;
  fallbackImageUrl?: string;
};

export type MapStoredAppointment = {
  id: string;
  locationObjectId: number;
  title: string;
  sportType: string;
  minPlayers: number;
  maxPlayers: number;
  startIso: string;
  durationMinutes: number;
  description: string;
  participants: { userId: string; displayName: string; joinedAt: string }[];
};

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function sportLabelToSport(label: string): Sport {
  const x = label.toLowerCase();
  if (x.includes('nogomet') || x.includes('futsal') || x.includes('malonogomet')) return 'futsal';
  if (x.includes('košark') || x.includes('kosark')) return 'košarka';
  if (x.includes('stolni tenis')) return 'tenis';
  if (x.includes('tenis')) return 'tenis';
  if (x.includes('trčanj') || x.includes('trcanj') || x.includes('trim') || x.includes('jogging') || x.includes('trčanje'))
    return 'trčanje';
  if (x.includes('odboj')) return 'odbojka';
  if (x.includes('badminton')) return 'badminton';
  return 'futsal';
}

const ORG_PALETTE: { bg: string; fg: string }[] = [
  { bg: '#dbeafe', fg: '#1e3a8a' },
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#d1fae5', fg: '#065f46' },
  { bg: '#ede9fe', fg: '#5b21b6' },
  { bg: '#fce7f3', fg: '#9d174d' },
];

function displayToInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '??';
}

function mapParticipants(parts: MapStoredAppointment['participants']): Organizer[] {
  return parts.map((p, i) => {
    const c = ORG_PALETTE[i % ORG_PALETTE.length];
    return {
      id: p.userId,
      name: p.displayName,
      initials: displayToInitials(p.displayName),
      avatarColor: c.bg,
      textColor: c.fg,
      rating: 4.5 + (i % 5) * 0.08,
      joinedAt: p.joinedAt,
    };
  });
}

function mapStoredChatToMessages(appointmentId: string): ChatMessage[] {
  const raw = getChatMessages(appointmentId) as {
    id: string;
    author: string;
    text: string;
    at: string;
  }[];
  return raw.map((m) => ({
    id: m.id,
    authorId: '',
    authorName: m.author,
    authorInitials: (m.author || '?').slice(0, 2).toUpperCase(),
    authorAvatarColor: 'bg-slate-200',
    authorTextColor: 'text-slate-800',
    text: m.text,
    timestamp: m.at,
    isSystem: false,
  }));
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export function mapAppointmentToEvent(
  a: MapStoredAppointment,
  loc: MergedLocation | undefined,
): Event {
  const start = new Date(a.startIso);
  const date = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;
  const startTime = `${pad2(start.getHours())}:${pad2(start.getMinutes())}`;

  const lat = loc?.lat ?? ZAGREB_REF.lat;
  const lng = loc?.lng ?? ZAGREB_REF.lng;
  const distanceKm = haversineKm(ZAGREB_REF.lat, ZAGREB_REF.lng, lat, lng);

  const spotsTaken = Array.isArray(a.participants) ? a.participants.length : 0;
  const sport = sportLabelToSport(a.sportType);

  const hoursUntil = (start.getTime() - Date.now()) / (1000 * 60 * 60);
  const isUrgent = hoursUntil > 0 && hoursUntil <= 2;

  const parts = mapParticipants(Array.isArray(a.participants) ? a.participants : []);
  const organizer: Organizer =
    parts[0] ??
    ({
      id: `org-${a.id}`,
      name: 'Organizator termina',
      initials: 'OT',
      avatarColor: '#e7e5e4',
      textColor: '#44403c',
      rating: 4.8,
    } as Organizer);

  const skillLevel: SkillLevel = 'svi';

  return {
    id: a.id,
    title: a.title,
    sport,
    sportTypeLabel: a.sportType,
    durationMinutes: a.durationMinutes,
    minPlayers: a.minPlayers,
    location: loc?.address?.trim() || 'Zagreb (javno igralište)',
    distanceKm,
    date,
    startTime,
    spotsTotal: a.maxPlayers,
    spotsTaken,
    skillLevel,
    pricePerPerson: 0,
    organizer,
    participants: parts.length > 0 ? parts : [organizer],
    isUrgent,
    description: String(a.description ?? '').trim() || 'Termin s karte javnih igrališta.',
    messages: mapStoredChatToMessages(a.id),
  };
}

let locationsCache: MergedLocation[] | null = null;

export async function ensureCourtLocationsLoaded(): Promise<MergedLocation[]> {
  if (locationsCache) {
    return locationsCache;
  }
  const [locations, overlays] = await Promise.all([
    loadLocationsFromCsv(),
    loadOverlayDatabase(),
  ]);
  const merged = mergeLocationsWithOverlayData(locations, overlays) as MergedLocation[];
  ensureDemoAppointments(merged, getSuggestedSportsForCourtType);
  locationsCache = merged;
  return merged;
}

/** Do 6 termina u sljedeća 72 h (isti podaci kao aktivni termini na karti). */
export async function loadMapCourtEventsForHome(): Promise<Event[]> {
  const merged = await ensureCourtLocationsLoaded();
  const byId = new Map(merged.map((l) => [l.objectId, l]));
  const upcoming = getUpcomingAppointmentsSoon(new Date(), 6, 72) as MapStoredAppointment[];
  return upcoming.map((a) => mapAppointmentToEvent(a, byId.get(a.locationObjectId)));
}

/** Detalj stranica: termin s karte (nakon učitavanja lokacija). */
export async function resolveEventForDetailPage(eventId: string | undefined): Promise<Event | null> {
  if (!eventId) {
    return null;
  }
  const merged = await ensureCourtLocationsLoaded();
  const byId = new Map(merged.map((l) => [l.objectId, l]));
  const raw = getAppointmentById(eventId) as MapStoredAppointment | null;
  if (!raw) {
    return null;
  }
  return mapAppointmentToEvent(raw, byId.get(raw.locationObjectId));
}
