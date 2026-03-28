import type { ChatMessage, Event, Organizer } from './types';
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

function sys(id: string, text: string, timestamp: string): ChatMessage {
  return {
    id,
    authorId: '',
    authorName: '',
    authorInitials: '',
    authorAvatarColor: '',
    authorTextColor: '',
    text,
    timestamp,
    isSystem: true,
  };
}

function chatMsg(
  id: string,
  authorId: string,
  authorName: string,
  authorInitials: string,
  authorAvatarColor: string,
  authorTextColor: string,
  text: string,
  timestamp: string,
): ChatMessage {
  return {
    id,
    authorId,
    authorName,
    authorInitials,
    authorAvatarColor,
    authorTextColor,
    text,
    timestamp,
    isSystem: false,
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
    description:
      'Brzi meč na umjetnoj travi, timovi od 5+1. Donesi crvenu i plavu majicu za raspodjelu timova. Zalijevanje nakon meča u kafiću preko puta ako netko želi. Fair play i pozitivna atmosfera!',
    messages: [
      sys('m1', 'Marko Kovač kreirao event', '2026-03-27T14:00:00'),
      chatMsg(
        'm2',
        marko.id,
        'Marko Kovač',
        'MK',
        'bg-amber-100',
        'text-amber-900',
        'Ekipa, ulaz je sa strane prema parku — teren je zatvoren pa se dogovorimo 10 min ranije kod vrata.',
        '2026-03-27T14:05:00',
      ),
      chatMsg(
        'm3',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Super, dolazim! Treba li donijeti loptu?',
        '2026-03-27T14:12:00',
      ),
      sys('m4', 'Ana Horvat se pridružila', '2026-03-27T14:45:00'),
      chatMsg(
        'm5',
        marko.id,
        'Marko Kovač',
        'MK',
        'bg-amber-100',
        'text-amber-900',
        'Ja nosim dvije, ali jedna više ne bi škodila ako netko ima staru futsal loptu.',
        '2026-03-27T14:50:00',
      ),
      chatMsg(
        'm6',
        ana.id,
        'Ana Horvat',
        'AH',
        'bg-blue-100',
        'text-blue-900',
        'Ima li parking blizu? Dolazim autom.',
        '2026-03-27T15:02:00',
      ),
      chatMsg(
        'm7',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Ana, ispred dvorane ima par mjesta, a ispod mosta još uvijek bude slobodno poslije 17h 👍',
        '2026-03-27T15:08:00',
      ),
      chatMsg(
        'm8',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Vidimo se! Dođite malo ranije da se zagrijemo uz bandu.',
        '2026-03-27T15:20:00',
      ),
    ],
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
    description:
      'Brzi 3v3 na vanjskom terenu kod Jaruna. Pravila FIBA street style, do 11 poena ili 12 min. Obavezna sportska obuća — nema klompi. Još jedno mjesto slobodno, javite se ako ćete odustati.',
    messages: [
      sys('k1', 'Ivan Babić kreirao event', '2026-03-26T10:00:00'),
      chatMsg(
        'k2',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Koš je dobro napumpan, donesite samo sebe. Ako padne kiša, idemo u halu 200m dalje — javim u chat.',
        '2026-03-26T10:10:00',
      ),
      chatMsg(
        'k3',
        marko.id,
        'Marko Kovač',
        'MK',
        'bg-amber-100',
        'text-amber-900',
        'Ja sam za. Ima li netko rezervnu majicu ako znojim ko prošli put? 😅',
        '2026-03-26T11:00:00',
      ),
      sys('k4', 'Petra Novak se pridružila', '2026-03-26T12:30:00'),
      chatMsg(
        'k5',
        petra.id,
        'Petra Novak',
        'PN',
        'bg-violet-100',
        'text-violet-900',
        'Parking kod Plive je ok, 5 min pješke. Ja nosim vodu za ekipu.',
        '2026-03-26T12:35:00',
      ),
      chatMsg(
        'k6',
        ana.id,
        'Ana Horvat',
        'AH',
        'bg-blue-100',
        'text-blue-900',
        'Može li netko pokupiti me kod Heinzelove? Kasnim 5 min max.',
        '2026-03-26T13:00:00',
      ),
      chatMsg(
        'k7',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Može, Ana — piši u DM kad si tu. Startamo točno u dogovoreno vrijeme da ne gubimo svjetlo.',
        '2026-03-26T13:05:00',
      ),
    ],
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
    description:
      'Rekreativni mješoviti parovi na šljaci — rotacija svakih 20 minuta tako da svi odigraju. Reketi možemo posuditi u klubu uz depozit. Dolazite 10 min ranije da podijelimo parove.',
    messages: [
      sys('t1', 'Ana Horvat kreirala event', '2026-03-25T09:00:00'),
      chatMsg(
        't2',
        ana.id,
        'Ana Horvat',
        'AH',
        'bg-blue-100',
        'text-blue-900',
        'Teren 3, loptice su u torbi kod recepcije — recite moje ime.',
        '2026-03-25T09:05:00',
      ),
      chatMsg(
        't3',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Ja imam svoj reket, ali trebam gutanje — ima li viška u klubu?',
        '2026-03-25T09:20:00',
      ),
      sys('t4', 'Petra Novak se pridružila', '2026-03-25T10:00:00'),
      chatMsg(
        't5',
        petra.id,
        'Petra Novak',
        'PN',
        'bg-violet-100',
        'text-violet-900',
        'Donijet ću novu tubu loptica, pa podijelimo trošak ako želite.',
        '2026-03-25T10:05:00',
      ),
      chatMsg(
        't6',
        ana.id,
        'Ana Horvat',
        'AH',
        'bg-blue-100',
        'text-blue-900',
        'Super Petra! Ispred kluba ima mjesta, samo pazite na jednosmjerku.',
        '2026-03-25T10:12:00',
      ),
      chatMsg(
        't7',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Dogovoreno, vidimo se na terenu — lagano zagrijavanje prije starta.',
        '2026-03-25T10:30:00',
      ),
    ],
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
    description:
      'Lagani krugovi oko Bundeka — tempo prilagođavamo najsporijem. Jedan duži krug (~4 km) ili dva kraća, glasovanje na licu mjesta. Donesi vodu i dobru volju.',
    messages: [
      sys('r1', 'Petra Novak kreirala event', '2026-03-24T07:00:00'),
      chatMsg(
        'r2',
        petra.id,
        'Petra Novak',
        'PN',
        'bg-violet-100',
        'text-violet-900',
        'Startamo kod glavnog ulaza Bundeka, kraj fontane. Tempo 6:00–6:15 / km.',
        '2026-03-24T07:05:00',
      ),
      chatMsg(
        'r3',
        marko.id,
        'Marko Kovač',
        'MK',
        'bg-amber-100',
        'text-amber-900',
        'Ja sam sporiji — može li netko ići sa mnom u drugoj grupi?',
        '2026-03-24T07:10:00',
      ),
      sys('r4', 'Ivan Babić se pridružio', '2026-03-24T07:20:00'),
      chatMsg(
        'r5',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Naravno Marko, ja ostajem s tobom u drugom krugu. Petra vodi brže grupu.',
        '2026-03-24T07:22:00',
      ),
      chatMsg(
        'r6',
        ana.id,
        'Ana Horvat',
        'AH',
        'bg-blue-100',
        'text-blue-900',
        'Gdje točno ostavljate torbe? Ima li nešto osigurano?',
        '2026-03-24T07:30:00',
      ),
      chatMsg(
        'r7',
        petra.id,
        'Petra Novak',
        'PN',
        'bg-violet-100',
        'text-violet-900',
        'Torbe ostavimo uz klupu kod starta — netko uvijek ostane 2 min. Nakon trčanja kava u kiosku ako želite.',
        '2026-03-24T07:35:00',
      ),
      chatMsg(
        'r8',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Vidimo se u 7:25, malo istegnem nogu prije.',
        '2026-03-24T07:40:00',
      ),
    ],
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
    description:
      'Lagani turnir u dvorani — dva poluvremena, fair play. Poželjno donijeti obje boje majice. Cijena pokriva najam terena; ostatak ide u piće nakon ako ostane.',
    messages: [
      sys('f1', 'Luka Jurić kreirao event', '2026-03-23T16:00:00'),
      chatMsg(
        'f2',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Dvorana je rezervirana od 21:00, ključeve uzimam ja — čekajte me ispred glavnog ulaza.',
        '2026-03-23T16:10:00',
      ),
      chatMsg(
        'f3',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Može. Ima li tuša u zgradi ili idem ravno kući?',
        '2026-03-23T16:25:00',
      ),
      sys('f4', 'Marko Kovač se pridružio', '2026-03-23T17:00:00'),
      chatMsg(
        'f5',
        marko.id,
        'Marko Kovač',
        'MK',
        'bg-amber-100',
        'text-amber-900',
        'Tuš radi, donesi ručnik. Ja nosim rezervnu loptu.',
        '2026-03-23T17:05:00',
      ),
      chatMsg(
        'f6',
        luka.id,
        'Luka Jurić',
        'LJ',
        'bg-pink-100',
        'text-pink-900',
        'Super. Plaćanje na licu mjesta ili unaprijed PayPal — kako vam više paše, pišem u DM.',
        '2026-03-23T17:15:00',
      ),
      chatMsg(
        'f7',
        ivan.id,
        'Ivan Babić',
        'IB',
        'bg-emerald-100',
        'text-emerald-900',
        'Ja cash, nema frke. Vidimo se subotom!',
        '2026-03-23T17:20:00',
      ),
    ],
  },
];
