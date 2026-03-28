import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Euro,
  ExternalLink,
  MapPin,
  Share2,
  Star,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChatOpenButton, ChatPanel } from '../components/ChatPanel';
import { InfoRow } from '../components/InfoRow';
import { NotFoundState } from '../components/NotFoundState';
import { OccupancyBar } from '../components/OccupancyBar';
import { ParticipantList } from '../components/ParticipantList';
import { sportColors, sportHeroBg, sportLabels } from '../constants/sportConfig';
import { mockEvents } from '../mockData';
import type { ChatMessage, SkillLevel } from '../types';
import {
  eventDateTimeIso,
  formatEventDate,
  getGoogleMapsUrl,
  getOccupancyPercent,
  getUrgentHoursLabel,
} from '../utils/eventHelpers';

const skillLabels: Record<SkillLevel, string> = {
  svi: 'Svi',
  početnici: 'Početnici',
  srednja: 'Srednja',
  napredni: 'Napredni',
};

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const event = mockEvents.find((e) => e.id === eventId);

  const [isJoined, setIsJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const ev = mockEvents.find((e) => e.id === eventId);
    if (!ev) {
      setMessages([]);
      return;
    }
    setMessages(structuredClone(ev.messages));
    setIsJoined(false);
    setChatOpen(false);
    setShowFullDescription(false);
  }, [eventId]);

  const left = event ? event.spotsTotal - event.spotsTaken : 0;
  const joinDisabled = !event || left <= 0;
  const occupancy = event ? getOccupancyPercent(event) : 0;
  const mapsUrl = event ? getGoogleMapsUrl(event.location) : '';
  const dateLabel = event ? formatEventDate(eventDateTimeIso(event)) : '';

  const urgentLabel =
    event && event.isUrgent ? getUrgentHoursLabel(event) : null;

  if (!event) {
    return <NotFoundState onBack={() => navigate('/')} />;
  }

  const handleShare = () => {
    console.log('Share event', event.id);
  };

  const handleJoin = () => {
    const welcomeMsg: ChatMessage = {
      id: crypto.randomUUID(),
      authorId: '',
      authorName: '',
      authorInitials: '',
      authorAvatarColor: '',
      authorTextColor: '',
      text: 'Ti si se pridružio/la eventu! 🎉',
      timestamp: new Date().toISOString(),
      isSystem: true,
    };
    const joinMsg: ChatMessage = {
      id: crypto.randomUUID(),
      authorId: 'me',
      authorName: 'Ti',
      authorInitials: 'TI',
      authorAvatarColor: 'bg-blue-100',
      authorTextColor: 'text-blue-800',
      text: 'Hej ekipa, dolazim! 👋',
      timestamp: new Date().toISOString(),
      isSystem: false,
    };
    setMessages((prev) => [...prev, welcomeMsg, joinMsg]);
    setIsJoined(true);
    setChatOpen(true);
  };

  const handleLeave = () => {
    setIsJoined(false);
  };

  return (
    <div className="relative mx-auto min-h-dvh max-w-sm bg-stone-100 pb-[max(7.5rem,env(safe-area-inset-bottom)+6rem)]">
      <header className="sticky top-0 z-20 grid grid-cols-[2.5rem_1fr_2.5rem] items-center border-b border-stone-200 bg-white px-2 py-2 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-stone-800 hover:bg-stone-100"
          aria-label="Natrag"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="min-w-0 truncate text-center text-sm font-semibold text-stone-900">
          {sportLabels[event.sport]}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center justify-self-end rounded-full text-stone-700 hover:bg-stone-100"
          aria-label="Podijeli"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      <section className={`px-4 pb-4 pt-4 ${sportHeroBg[event.sport]}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold ${sportColors[event.sport].badge}`}
          >
            {sportLabels[event.sport]}
          </span>
          {event.isUrgent && urgentLabel ? (
            <span className="urgent-pill-sportaj rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white">
              UŽIVO · {urgentLabel}
            </span>
          ) : null}
        </div>
        <h2 className="mt-3 text-xl font-bold leading-tight text-stone-900">{event.title}</h2>
      </section>

      <div className="space-y-1 bg-white px-4 py-2">
        <InfoRow icon={<Calendar className="h-4 w-4" />} label="Datum" value={dateLabel} />
        <InfoRow icon={<Clock className="h-4 w-4" />} label="Početak" value={event.startTime} />
        <InfoRow icon={<MapPin className="h-4 w-4" />} label="Teren" value={event.location} />
        <InfoRow
          icon={<ExternalLink className="h-4 w-4" />}
          label=""
          value={
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Otvori u Google Maps →
            </a>
          }
        />
        <InfoRow
          icon={<Users className="h-4 w-4" />}
          label="Razina"
          value={skillLabels[event.skillLevel]}
        />
        <InfoRow
          icon={<Euro className="h-4 w-4" />}
          label="Cijena"
          value={
            event.pricePerPerson === 0 ? (
              <span className="text-emerald-700">Besplatno</span>
            ) : (
              `${event.pricePerPerson} € / osoba`
            )
          }
        />
      </div>

      <section className="mt-3 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-stone-900">O eventu</h3>
        <p
          className={`mt-2 text-sm leading-relaxed text-stone-600 ${
            showFullDescription ? '' : 'line-clamp-3'
          }`}
        >
          {event.description}
        </p>
        {event.description.length > 140 ? (
          <button
            type="button"
            onClick={() => setShowFullDescription((v) => !v)}
            className="mt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
          >
            {showFullDescription ? 'Prikaži manje' : 'Prikaži više'}
          </button>
        ) : null}
      </section>

      <section className="mt-3 bg-white px-4 py-4">
        <h3 className="text-sm font-semibold text-stone-900">
          Sudionici ({event.spotsTaken} / {event.spotsTotal})
        </h3>
        <div className="mt-2">
          <OccupancyBar percent={occupancy} />
        </div>
        <div className="mt-4">
          <ParticipantList
            participants={event.participants}
            onAvatarClick={(p) => console.log('Avatar', p.name)}
          />
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-stone-50 p-3 ring-1 ring-stone-200/80">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{
              backgroundColor: event.organizer.avatarColor,
              color: event.organizer.textColor,
            }}
          >
            {event.organizer.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">Organizator</p>
            <p className="truncate text-sm font-semibold text-stone-900">{event.organizer.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-amber-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden />
              <span className="font-medium">{event.organizer.rating.toFixed(1)}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 px-4">
        <ChatOpenButton messageCount={messages.length} onClick={() => setChatOpen(true)} />
      </div>

      <div className="fixed bottom-0 left-1/2 z-30 w-full max-w-sm -translate-x-1/2 border-t border-stone-200 bg-white/95 px-4 py-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {isJoined ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
              Prijavljen si!
            </div>
            <button
              type="button"
              onClick={handleLeave}
              className="w-full rounded-2xl border-2 border-stone-300 bg-white py-3.5 text-sm font-semibold text-stone-800 hover:bg-stone-50"
            >
              Odjaviti se
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={joinDisabled}
            onClick={handleJoin}
            className={`w-full rounded-2xl py-3.5 text-sm font-semibold ${
              joinDisabled
                ? 'cursor-not-allowed bg-stone-200 text-stone-400'
                : 'bg-stone-900 text-white hover:bg-stone-800'
            }`}
          >
            Prijavi se
          </button>
        )}
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        setMessages={setMessages}
        title="Chat ekipe"
      />
    </div>
  );
}
