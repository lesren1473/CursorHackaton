# Cursor Prompt — Sportaj: Home Screen

## Kontekst projekta

Gradi mobile-first web app pod radnim nazivom **"Sportaj"** — platforma za organiziranje spontanih sportskih druženja. Korisnici objavljuju termin, sport i lokaciju, a drugi se mogu pridružiti. Ovo je **samo početna stranica (home screen)** s hardkodiranim podacima, bez backenda. Fokus je na čistoj arhitekturi komponenti koja se lako proširuje.

---

## Tech stack

- **React** + **TypeScript**
- **Tailwind CSS** za styling
- **Vite** kao bundler
- Nikakav backend, nikakav state management library — samo `useState` i `props`

---

## Što treba izgraditi

### 1. Struktura podataka (types.ts)

Definiraj TypeScript tipove koji će biti osnova za sve komponente:

```ts
type Sport = 'futsal' | 'košarka' | 'tenis' | 'trčanje' | 'odbojka' | 'badminton';

type SkillLevel = 'svi' | 'početnici' | 'srednja' | 'napredni';

type TimeFilter = 'danas' | 'sutra' | 'ovaj tjedan';

interface Organizer {
  id: string;
  name: string;
  initials: string;        // npr. "AK"
  avatarColor: string;     // tailwind bg class, npr. "bg-emerald-100"
  textColor: string;       // tailwind text class, npr. "text-emerald-800"
  rating: number;          // 1–5
}

interface Event {
  id: string;
  title: string;
  sport: Sport;
  location: string;        // naziv mjesta, npr. "NK Dinamo teren"
  distanceKm: number;      // udaljenost od korisnika
  date: string;            // ISO string
  startTime: string;       // "18:00"
  spotsTotal: number;
  spotsTaken: number;
  skillLevel: SkillLevel;
  pricePerPerson: number;  // 0 = besplatno
  organizer: Organizer;
  participants: Organizer[]; // lista prijavljenih (bez organizatora)
  isUrgent: boolean;       // true ako počinje za < 3h
}
```

### 2. Hardkodirani mock podaci (mockData.ts)

Kreiraj **5 evenata** s realističnim podacima za Zagreb. Rasporedi ih tako da demonstriraju sve edge caseove:

- Jedan urgent event (za ~2h, puno slobodnih mjesta)
- Jedan s 1 slobodnim mjestom (spots barely left)
- Jedan besplatan, jedan s cijenom
- Jedan za "sutra" (ne za danas)
- Razni sportovi: futsal, košarka, tenis, trčanje

### 3. Komponente (u `/src/components/`)

Svaka komponenta treba biti u svom fajlu s jasnim props interfaceom.

---

#### `SportFilter.tsx`
Horizontalni scroll red s ikonama sportova.

**Props:**
```ts
interface SportFilterProps {
  sports: Sport[];           // lista dostupnih sportova
  selected: Sport | null;    // null = "Sve"
  onSelect: (sport: Sport | null) => void;
}
```

**Ponašanje:**
- "Sve" opcija uvijek prva, selectana po defaultu
- Ikona + label ispod za svaki sport
- Aktivni sport vizualno naglašen (tamna pozadina)
- Horizontalni scroll bez vidljivog scrollbara

---

#### `TimeFilter.tsx`
Tab switcher: Danas / Sutra / Ovaj tjedan

**Props:**
```ts
interface TimeFilterProps {
  selected: TimeFilter;
  onChange: (filter: TimeFilter) => void;
  counts: Record<TimeFilter, number>; // broj evenata po filteru
}
```

---

#### `MapStrip.tsx`
Statični map placeholder (za sada bez prave mape).

**Props:**
```ts
interface MapStripProps {
  onExpand: () => void; // callback za "Otvori mapu"
  eventCount: number;   // broj pinova koje pokazuje
}
```

**Implementacija:**
- Zelenkasta SVG "mapa" s cestama i pinovima kao placeholder
- Svaki pin je obojeni krug s prvim slovom sporta
- Gumb "Otvori mapu →" u donjem desnom kutu
- `onExpand` trenutno samo `console.log('map expand')` — hook za buduću integraciju

---

#### `EventCard.tsx`
Glavna kartica jednog eventa.

**Props:**
```ts
interface EventCardProps {
  event: Event;
  onJoin: (eventId: string) => void;    // prijava
  onSave: (eventId: string) => void;    // spremi za kasnije
  isSaved: boolean;
}
```

**Prikazuje:**
- Sport badge (boja prema sportu)
- Urgent pill "za Xh" ako `isUrgent === true` + sat početka
- Naslov, lokacija, udaljenost, razina, cijena
- Mini avatari sudionika (max 3 prikazana + "+N" ako više)
- Spots status: zeleno ako > 2 slobodna, žuto ako 1–2, crveno ako puno
- Gumb "Prijavi se" / "Spremi" (disabled ako nema mjesta)

**Spots logika:**
```ts
const spotsLeft = event.spotsTotal - event.spotsTaken;
// > 2: "X slobodnih mjesta" — zeleno
// 1-2: "Još X mjesta!" — žuto/amber
// 0: "Popunjeno" — crveno, gumb disabled
```

---

#### `EventList.tsx`
Container koji prima filtrirane evente i renderira EventCard komponente.

**Props:**
```ts
interface EventListProps {
  events: Event[];
  savedEventIds: Set<string>;
  onJoin: (eventId: string) => void;
  onSave: (eventId: string) => void;
}
```

- Ako je lista prazna, prikaži prazan state: "Nema evenata za ovaj filter."
- Evente koji su za "sutra" ili dalje vizualno zasivi (opacity-60) ako je aktivan "Danas" filter

---

#### `TopBar.tsx`
Gornji header s logom, notifikacijama i avatarom.

**Props:**
```ts
interface TopBarProps {
  userName: string;
  userInitials: string;
  notificationCount: number;
}
```

---

#### `GreetingBanner.tsx`
Personalizirani pozdrav s brojem eventi.

**Props:**
```ts
interface GreetingBannerProps {
  userName: string;
  city: string;
  eventCount: number;
  timeOfDay: 'jutro' | 'dan' | 'večer'; // za "Dobro jutro/dan/večer"
}
```

---

#### `BottomNav.tsx`
Navigacija s 4 taba: Početna / Mapa / Moji eventi / Profil

**Props:**
```ts
interface BottomNavProps {
  active: 'home' | 'map' | 'my-events' | 'profile';
  onChange: (tab: 'home' | 'map' | 'my-events' | 'profile') => void;
}
```

---

#### `FABButton.tsx`
Full-width "Objavi event" gumb na dnu liste.

**Props:**
```ts
interface FABButtonProps {
  onClick: () => void; // trenutno samo console.log
}
```

---

### 4. Filtriranje (u `HomePage.tsx`)

Sva logika filtriranja živi u `HomePage.tsx` kao `useState`. **Bez Redux, bez Context** za sada.

```ts
const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
const [timeFilter, setTimeFilter] = useState<TimeFilter>('danas');
const [savedEventIds, setSavedEventIds] = useState<Set<string>>(new Set());
```

**Filtering logika:**
```ts
const filteredEvents = mockEvents
  .filter(e => selectedSport === null || e.sport === selectedSport)
  .filter(e => {
    // filtriranje prema timeFilter i event.date
    // za sada: "danas" = prvih N evenata, "sutra" = sljedeći, itd.
    // koristiti date-fns ili native Date usporedbu
  })
  .sort((a, b) => a.distanceKm - b.distanceKm); // default sort po udaljenosti
```

---

### 5. Vizualni dizajn

**Boje po sportu (Tailwind classes):**
```ts
const sportColors: Record<Sport, { badge: string; pin: string }> = {
  futsal:    { badge: 'bg-blue-50 text-blue-800',   pin: '#1e6fb5' },
  košarka:   { badge: 'bg-amber-50 text-amber-800', pin: '#b07010' },
  tenis:     { badge: 'bg-green-50 text-green-800', pin: '#2f6b10' },
  trčanje:   { badge: 'bg-purple-50 text-purple-900', pin: '#4a3aaa' },
  odbojka:   { badge: 'bg-coral-50 text-rose-800',  pin: '#c0392b' },
  badminton: { badge: 'bg-teal-50 text-teal-800',   pin: '#0f766e' },
};
```

**Font:** Koristiti `DM Sans` iz Google Fonts — geometrijski, čitljiv, moderan za sport app.

**Mobile-first:** Max width kontejnera je `max-w-sm mx-auto` (375px) — simulira mobile screen na desktopu. Na manjim ekranima full width.

**Spacing sustav:** Dosljedno koristiti Tailwind spacing skalu. Kartice imaju `rounded-2xl`, `p-3.5`. Bottom nav fiksan na dnu s `pb-safe` padding za iPhone notch.

---

### 6. Arhitektura fajlova

```
src/
├── types.ts
├── mockData.ts
├── utils/
│   └── eventHelpers.ts    # getTimeLabel(), getSpotsStatus(), getGreeting()
├── constants/
│   └── sportConfig.ts     # boje, ikone, labeli po sportu
├── components/
│   ├── TopBar.tsx
│   ├── GreetingBanner.tsx
│   ├── TimeFilter.tsx
│   ├── SportFilter.tsx
│   ├── MapStrip.tsx
│   ├── EventCard.tsx
│   ├── EventList.tsx
│   ├── BottomNav.tsx
│   └── FABButton.tsx
└── pages/
    └── HomePage.tsx       # sve state + filtering logika ovdje
```

---

### 7. Skalabilnost — što mora biti lako dodati kasnije

Implementiraj s ovim u vidu (ali **ne implementiraj sada**):

- **Nova vrsta sporta:** Samo dodaj u `Sport` union type i `sportConfig.ts` — sve ostalo se automatski ažurira
- **Pravi backend:** `mockData.ts` se zamijeni s `useEvents()` custom hookom — komponente se ne diraju
- **Prava mapa:** `MapStrip.tsx` prima isti `events` prop — samo zamijeni SVG s Leaflet/Mapbox komponentom
- **Filtriranje po udaljenosti:** Dodaj `maxDistanceKm` u filter state — `eventHelpers.ts` već ima `distanceKm` field
- **Infinite scroll:** `EventList.tsx` prima `page` prop i `onLoadMore` callback — dodaj po potrebi

---

## Što NE treba raditi

- Ne spajati se na nikakav API
- Ne koristiti React Router za sada (sve je jedna stranica)
- Ne implementirati auth/login
- Ne pisati testove
- Ne koristiti UI library (Shadcn, MUI itd.) — sve custom Tailwind

---

## Finalni output

Pokretljiva React aplikacija u browseru koja izgleda kao poliran mobile prototype. Svi filteri rade lokalno na mockData. Gumbi "Prijavi se" i "Spremi" mijenjaju UI state bez backenda.
