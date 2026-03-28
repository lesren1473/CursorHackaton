# Cursor Prompt — Sportaj: Event Detail Page + Chat Panel

## Kontekst

Nadograđuješ postojeći Sportaj React/TypeScript/Tailwind projekt.
`types.ts`, `mockData.ts`, `sportConfig.ts` i `HomePage.tsx` već postoje.
Dodaješ dvije stvari:
1. **`EventDetailPage.tsx`** — full screen stranica za detalje eventa
2. **`ChatPanel.tsx`** — slide-in panel s desne strane s mock chatom

---

## 1. Routing setup

Instaliraj i konfiguriraj React Router:

```bash
npm install react-router-dom
```

U `main.tsx` wrapaj app s `<BrowserRouter>`.

U `App.tsx` definiraj rute:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/event/:eventId" element={<EventDetailPage />} />
</Routes>
```

U `EventCard.tsx` wrapaj cijelu karticu s:
```tsx
<Link to={`/event/${event.id}`} style={{ textDecoration: 'none' }}>
```
— ali gumb "Prijavi se" i "Spremi" trebaju `e.stopPropagation()` + `e.preventDefault()` da ne triggeraju navigaciju.

---

## 2. Novi tipovi (dodaj u `types.ts`)

```ts
interface ChatMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorAvatarColor: string; // tailwind bg class
  authorTextColor: string;   // tailwind text class
  text: string;
  timestamp: string;         // ISO string
  isSystem: boolean;         // true za auto-poruke ("Marko se pridružio!")
}
```

---

## 3. Mock chat podaci (dodaj u `mockData.ts`)

Za svaki event dodaj `messages: ChatMessage[]` array.
Kreiraj realistični razgovor od **6–8 poruka** koji simulira pravi dogovor:

- Poruke o terminu, opremi, parkingu
- Jedna system poruka na početku: `"[Ime organizatora] kreirao event"`
- Jedna system poruka negdje u sredini: `"[Ime] se pridružio/la"`
- Poruke pisane na hrvatskom, casualnim stilom

Primjer za futsal event:
```ts
messages: [
  { isSystem: true, text: "Tomislav kreirao event", timestamp: "2024-01-15T14:00:00" },
  { authorName: "Tomislav", text: "Ekipa, teren je na sjevernoj strani parka, ulaz s Maksimirske", ... },
  { authorName: "Luka", text: "Super, dolazim! Treba li donijeti loptu?", ... },
  { isSystem: true, text: "Marko se pridružio", timestamp: "2024-01-15T14:45:00" },
  { authorName: "Tomislav", text: "Ja nosim dvije, ali jedna više ne bi škodila", ... },
  { authorName: "Jana", text: "Ima li parking blizu?", ... },
  { authorName: "Marko", text: "Jana da, free parking odmah pored terena 👍", ... },
  { authorName: "Luka", text: "Vidimo se! Dođite malo ranije da se zagrijemo", ... },
]
```

---

## 4. `EventDetailPage.tsx`

### Struktura layouta (mobile-first, max-w-sm mx-auto):

```
┌─────────────────────────────┐
│ Back arrow    Naslov sporta │  ← TopBar (sticky)
├─────────────────────────────┤
│                             │
│   Sport hero section        │  ← boja prema sportu, naziv eventa
│                             │
├─────────────────────────────┤
│ 📅 Kada        🕕 18:00     │
│ 📍 Teren       [Maps gumb]  │
│ 💪 Razina      💶 Cijena    │
├─────────────────────────────┤
│ Opis eventa                 │
├─────────────────────────────┤
│ Sudionici (X / Y)           │
│ [Avatar] [Avatar] [Avatar]  │
│ Organizator: [profil row]   │
├─────────────────────────────┤
│        [Chat gumb]          │
├─────────────────────────────┤
│   [Prijavi se / Odjaviti]   │  ← sticky bottom CTA
└─────────────────────────────┘
```

### Detalji svake sekcije:

**TopBar (sticky, na vrhu):**
- Lijevo: `←` back arrow koji radi `navigate(-1)`
- Sredina: naziv sporta (npr. "Futsal")
- Desno: share ikona (samo `console.log` za sada)
- Bijela pozadina, border-bottom

**Hero sekcija:**
- Pozadinska boja prema sportu (light varijanta iz `sportConfig.ts`)
- Veliki naslov eventa (npr. "Futsal — NK Dinamo teren")
- Sport badge
- Ako `isUrgent === true`: animirani pulsing "UŽIVO · Za 2h" pill

**Info grid (2 stupca):**
```tsx
// svaki info item:
<InfoRow icon={<CalendarIcon/>} label="Datum" value="Petak, 19. siječnja" />
<InfoRow icon={<ClockIcon/>}    label="Početak" value="18:00" />
<InfoRow icon={<MapPinIcon/>}   label="Teren" value={event.location} />
<InfoRow icon={<LinkIcon/>}     label="" value={
  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
    Otvori u Google Maps →
  </a>
} />
<InfoRow icon={<UsersIcon/>}    label="Razina" value={event.skillLevel} />
<InfoRow icon={<EuroIcon/>}     label="Cijena" value={
  event.pricePerPerson === 0 ? "Besplatno" : `${event.pricePerPerson}€ / osoba`
} />
```

Google Maps URL generirati ovako:
```ts
const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location + ', Zagreb')}`;
```

**Opis sekcija:**
- Heading "O eventu"
- Paragraph tekst (dodaj `description: string` field u `Event` type i mock podatke)
- Max 3 reda, "Prikaži više" toggle ako je duže

**Sudionici sekcija:**
- Heading "Sudionici (X/Y)"
- Progress bar koji vizualno pokazuje popunjenost
- Row avatara: svaki avatar je klikabilan (za sada `console.log`)
- Organizator posebno istaknut s labelom "Organizator" i zvjezdicom + ocjenom

**Chat gumb:**
```tsx
<button onClick={() => setChatOpen(true)}>
  <ChatIcon />
  Chat ekipe
  <span>{messages.length} poruka</span>
  <ChevronRightIcon />
</button>
```
— full width, outlined stil, između sudionika i prijava gumba

**Sticky bottom CTA:**
- Fiksiran na dnu ekrana
- Ako nije prijavljen: tamni "Prijavi se" gumb
- Ako je prijavljen: outline "Odjaviti se" gumb + zelena checkmark "Prijavljen si!"
- Padding-bottom za iPhone notch (`pb-safe` ili `pb-8`)

### Prijava logika:

```tsx
const [isJoined, setIsJoined] = useState(false);

const handleJoin = () => {
  setIsJoined(true);
  // Dodaj system poruku u chat
  const welcomeMsg: ChatMessage = {
    id: crypto.randomUUID(),
    isSystem: true,
    text: "Ti si se pridružio/la eventu! 🎉",
    timestamp: new Date().toISOString(),
    // ostala polja prazna za system msg
  };
  const joinMsg: ChatMessage = {
    id: crypto.randomUUID(),
    authorName: "Ti", // hardkodirani trenutni user
    authorInitials: "TI",
    authorAvatarColor: "bg-blue-100",
    authorTextColor: "text-blue-800",
    text: "Hej ekipa, dolazim! 👋",
    timestamp: new Date().toISOString(),
    isSystem: false,
  };
  setMessages(prev => [...prev, welcomeMsg, joinMsg]);
  setChatOpen(true); // odmah otvori chat
};
```

---

## 5. `ChatPanel.tsx`

### Ponašanje:

- Slide in s **desne strane** — CSS `transform: translateX(100%)` → `translateX(0)`
- Transition: `transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)`
- Širina: `100%` na mobilnom (full screen), `400px` na desktopu
- Overlay (zatamnjenje pozadine) klikabilan za zatvaranje
- Swipe-to-close: dodaj touch event listener koji detektira swipe udesno (> 80px) i zatvara panel

### Struktura chat panela:

```
┌─────────────────────────────┐
│ ← Natrag    Chat ekipe  [X] │  ← header
├─────────────────────────────┤
│                             │
│  [system] Tomislav kreirao  │
│                             │
│  [Avatar] Tomislav          │
│  "Teren je na sjevernoj..." │
│  14:05                      │
│                             │
│  [Avatar] Luka              │
│  "Super, dolazim!"          │
│  14:12                      │
│                             │
│  [system] Marko se pridružio│
│                             │
│  ... (scrollable)           │
│                             │
├─────────────────────────────┤
│ [Input: Napiši poruku...] → │  ← sticky bottom
└─────────────────────────────┘
```

### Message bubble stilovi:

**System poruke:**
```tsx
// centrirane, bez avatara, italic, muted boja
<div className="flex justify-center my-2">
  <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1 rounded-full">
    {message.text}
  </span>
</div>
```

**Regularne poruke:**
```tsx
// lijevo poravnate, avatar + ime + tekst + timestamp
<div className="flex gap-2 mb-3">
  <div className={`w-8 h-8 rounded-full flex-shrink-0 ${msg.authorAvatarColor} ...`}>
    {msg.authorInitials}
  </div>
  <div>
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium">{msg.authorName}</span>
      <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
    </div>
    <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 text-sm mt-1">
      {msg.text}
    </div>
  </div>
</div>
```

### Input za slanje poruke:

```tsx
const [inputText, setInputText] = useState('');

const handleSend = () => {
  if (!inputText.trim()) return;
  const newMsg: ChatMessage = {
    id: crypto.randomUUID(),
    authorName: "Ti",
    authorInitials: "TI",
    authorAvatarColor: "bg-blue-100",
    authorTextColor: "text-blue-800",
    text: inputText.trim(),
    timestamp: new Date().toISOString(),
    isSystem: false,
  };
  setMessages(prev => [...prev, newMsg]);
  setInputText('');
  // auto-scroll na dno
  setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, 50);
};

// Send na Enter (ne Shift+Enter)
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};
```

Auto-scroll na dno kada se panel otvori i kada stigne nova poruka:
```tsx
useEffect(() => {
  if (isOpen) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  }
}, [isOpen, messages.length]);
```

---

## 6. State management u `EventDetailPage.tsx`

```tsx
const { eventId } = useParams<{ eventId: string }>();
const event = mockEvents.find(e => e.id === eventId);

const [isJoined, setIsJoined] = useState(false);
const [chatOpen, setChatOpen] = useState(false);
const [messages, setMessages] = useState<ChatMessage[]>(event?.messages ?? []);
const [showFullDescription, setShowFullDescription] = useState(false);
```

Ako `event` nije nađen (nepostojeći ID):
```tsx
if (!event) return <NotFoundState onBack={() => navigate('/')} />;
```

---

## 7. Animacije

Samo CSS transitions, bez library-a:

```css
/* Chat panel slide */
.chat-panel {
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.chat-panel.open {
  transform: translateX(0);
}

/* Overlay fade */
.overlay {
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}
.overlay.open {
  opacity: 1;
  pointer-events: all;
}

/* Urgent pill pulse */
@keyframes pulse-urgent {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
.urgent-pill {
  animation: pulse-urgent 1.5s ease-in-out infinite;
}
```

---

## 8. Helper funkcije (dodaj u `eventHelpers.ts`)

```ts
// Formatiraj datum: "2024-01-19T18:00:00" → "Petak, 19. siječnja"
export const formatEventDate = (isoString: string): string => { ... }

// Formatiraj chat timestamp: "2024-01-19T14:05:00" → "14:05"
export const formatChatTime = (isoString: string): string => { ... }

// Generiraj Google Maps URL
export const getGoogleMapsUrl = (location: string, city = 'Zagreb'): string =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location}, ${city}`)}`;

// Koliko % popunjen event
export const getOccupancyPercent = (event: Event): number =>
  Math.round((event.spotsTaken / event.spotsTotal) * 100);
```

---

## 9. Ikone

Koristiti `lucide-react` (vjerojatno već instaliran, ako ne: `npm install lucide-react`):

```tsx
import {
  ArrowLeft, Share2, Calendar, Clock, MapPin, ExternalLink,
  Users, Euro, MessageCircle, ChevronRight, X, Send, Check
} from 'lucide-react';
```

---

## 10. Arhitektura fajlova — što se dodaje

```
src/
├── types.ts                    ← dodaj ChatMessage interface + description u Event
├── mockData.ts                 ← dodaj messages[] i description za svaki event
├── utils/
│   └── eventHelpers.ts         ← dodaj formatEventDate, formatChatTime, getGoogleMapsUrl, getOccupancyPercent
├── components/
│   ├── ChatPanel.tsx           ← novo
│   ├── InfoRow.tsx             ← novo (reusable info red s ikonom)
│   ├── OccupancyBar.tsx        ← novo (progress bar sudionika)
│   ├── ParticipantList.tsx     ← novo
│   └── NotFoundState.tsx       ← novo (fallback za nepostojeći event ID)
└── pages/
    ├── HomePage.tsx            ← postojeće, ne diraj
    └── EventDetailPage.tsx     ← novo
```

---

## Što NE treba raditi

- Ne implementirati pravi real-time chat (nema WebSocket, nema Supabase)
- Ne persistirati joined status (refresh = reset, to je ok)
- Ne implementirati user auth — "Ti" je hardkodirani korisnik
- Ne dodavati animacije scrollanja između stranica (React Router default je ok)
- Swipe gesture samo detektirati, ne koristiti library za to

---

## Finalni output

Klik na event karticu → otvara `/event/[id]` full screen stranicu s detaljima.
Klik "Chat ekipe" → slide-in panel s desna, poruke su scrollable.
Klik "Prijavi se" → status se mijenja, auto-otvara chat, pojavljuju se dvije nove poruke.
Back arrow → vraća na home s listom.
Sve responzivno: mobile (375px) i desktop (chat panel fiksne 400px širine).
