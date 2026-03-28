import type { Event, Organizer } from './types';
import { formatLocalDate } from './utils/eventHelpers';

const pad = (n: number) => String(n).padStart(2, '0');

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function timeOnDate(base: Date, hours: number, minutes: number): { date: string; startTime: string } {
  const d = new Date(base);
  d.setHours(hours, minutes, 0, 0);
  return {
    date: formatLocalDate(d),
    startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

function hoursFromNow(base: Date, hours: number): { date: string; startTime: string } {
  const d = new Date(base.getTime() + hours * 60 * 60 * 1000);
  return {
    date: formatLocalDate(d),
    startTime: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

const now = new Date();

const ana: Organizer = {
  id: 'o1',
  name: 'Ana Horvat',
  initials: 'AH',
  avatarColor: '#dbeafe',
  textColor: '#1e3a8a',
  rating: 4.9,
};

const marko: Organizer = {
  id: 'o2',
  name: 'Marko Kovač',
  initials: 'MK',
  avatarColor: '#fef3c7',
  textColor: '#92400e',
  rating: 4.7,
};

const ivan: Organizer = {
  id: 'o3',
  name: 'Ivan Babić',
  initials: 'IB',
  avatarColor: '#d1fae5',
  textColor: '#065f46',
  rating: 4.8,
};

const petra: Organizer = {
  id: 'o4',
  name: 'Petra Novak',
  initials: 'PN',
  avatarColor: '#ede9fe',
  textColor: '#5b21b6',
  rating: 5,
};

const luka: Organizer = {
  id: 'o5',
  name: 'Luka Jurić',
  initials: 'LJ',
  avatarColor: '#fce7f3',
  textColor: '#9d174d',
  rating: 4.6,
};

const urgentSlot = hoursFromNow(now, 2);

const eveningFutsal = timeOnDate(now, 21, 0);

const tomorrow = addDays(now, 1);
const morningRun = timeOnDate(tomorrow, 7, 30);

const košarkaToday = timeOnDate(now, 19, 0);

const tenisToday = timeOnDate(now, 17, 30);

/** 5 Zagreb-area events: urgent, 1 spot left, free, paid, tomorrow; sports futsal/košarka/tenis/trčanje */
export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Futsal Trešnjevka — brzi meč',
    sport: 'futsal',
    location: 'SD Trešnjevka, Zagreb',
    distanceKm: 2.1,
    date: urgentSlot.date,
    startTime: urgentSlot.startTime,
    spotsTotal: 10,
    spotsTaken: 7,
    skillLevel: 'srednja',
    pricePerPerson: 25,
    organizer: marko,
    participants: [ana, ivan, petra, luka, marko],
    isUrgent: true,
  },
  {
    id: 'e2',
    title: 'Košarka 3v3 Jarun',
    sport: 'košarka',
    location: 'Vanjsko igralište Jarun',
    distanceKm: 4.5,
    date: košarkaToday.date,
    startTime: košarkaToday.startTime,
    spotsTotal: 6,
    spotsTaken: 5,
    skillLevel: 'napredni',
    pricePerPerson: 15,
    organizer: ivan,
    participants: [ana, marko, petra, ivan],
    isUrgent: false,
  },
  {
    id: 'e3',
    title: 'Tenis — mješoviti parovi',
    sport: 'tenis',
    location: 'TK Maksimir, Zagreb',
    distanceKm: 3.2,
    date: tenisToday.date,
    startTime: tenisToday.startTime,
    spotsTotal: 8,
    spotsTaken: 4,
    skillLevel: 'svi',
    pricePerPerson: 0,
    organizer: ana,
    participants: [luka, petra],
    isUrgent: false,
  },
  {
    id: 'e4',
    title: 'Jutarnji tempo — Bundek',
    sport: 'trčanje',
    location: 'Okrugli put oko Bundeka',
    distanceKm: 5.8,
    date: morningRun.date,
    startTime: morningRun.startTime,
    spotsTotal: 20,
    spotsTaken: 12,
    skillLevel: 'početnici',
    pricePerPerson: 10,
    organizer: petra,
    participants: [ana, marko, ivan, luka, petra],
    isUrgent: false,
  },
  {
    id: 'e5',
    title: 'Futsal subota — lagani turnir',
    sport: 'futsal',
    location: 'DV Prečko, Zagreb',
    distanceKm: 6.2,
    date: eveningFutsal.date,
    startTime: eveningFutsal.startTime,
    spotsTotal: 12,
    spotsTaken: 8,
    skillLevel: 'početnici',
    pricePerPerson: 20,
    organizer: luka,
    participants: [marko, ivan],
    isUrgent: false,
  },
];
