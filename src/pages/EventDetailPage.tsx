import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAppointmentById,
  getOrCreateUserProfile,
  joinAppointment,
  leaveAppointment,
  saveUserDisplayName,
  userHasJoined,
} from '../appointments.js';
import { ChatPanel } from '../components/ChatPanel';
import { NotFoundState } from '../components/NotFoundState';
import { sportLabels } from '../constants/sportConfig';
import { resolveEventForDetailPage } from '../mapCourt/eventBridge';
import { mockEvents } from '../mockData';
import type { ChatMessage, Event } from '../types';
import { formatEventAppointmentRange, formatJoinedAtHr } from '../utils/eventHelpers';

function isPersistedCourtAppointment(eventId: string | undefined): boolean {
  if (!eventId) {
    return false;
  }
  return getAppointmentById(eventId) != null;
}

function detailSportLabel(event: Event): string {
  return event.sportTypeLabel ?? sportLabels[event.sport];
}

function detailMinPlayers(event: Event): number {
  return event.minPlayers ?? 1;
}

export function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null | undefined>(undefined);
  const [isJoined, setIsJoined] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setEvent(undefined);
    setIsJoined(false);
    setChatOpen(false);
    setDisplayName('');
    setJoinError(null);

    (async () => {
      const fromMap = await resolveEventForDetailPage(eventId);
      if (cancelled) {
        return;
      }
      const ev = fromMap ?? mockEvents.find((e) => e.id === eventId) ?? null;
      setEvent(ev);
      if (ev) {
        setMessages(structuredClone(ev.messages));
      } else {
        setMessages([]);
      }

      if (!cancelled && eventId && ev) {
        const appt = getAppointmentById(eventId);
        if (appt) {
          const profile = getOrCreateUserProfile();
          if (userHasJoined(appt, profile.userId)) {
            setIsJoined(true);
            if (profile.displayName.trim()) {
              setDisplayName(profile.displayName.trim());
            }
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const left = event ? event.spotsTotal - event.spotsTaken : 0;
  const joinDisabled = !event || left <= 0;
  const full = event ? event.spotsTaken >= event.spotsTotal : false;

  if (event === undefined) {
    return (
      <div className="flex min-h-dvh max-w-sm flex-col items-center justify-center bg-slate-100 text-sm text-slate-500">
        Učitavanje…
      </div>
    );
  }

  if (!event) {
    return <NotFoundState onBack={() => navigate('/')} />;
  }

  const desc = String(event.description ?? '').trim();
  const rangeStr = formatEventAppointmentRange(event);
  const n = event.spotsTaken;

  const handleJoin = async () => {
    const name = displayName.trim();
    const court = isPersistedCourtAppointment(event.id);

    if (court) {
      const profile = getOrCreateUserProfile();
      const result = joinAppointment(event.id, profile.userId, name) as {
        ok: boolean;
        error?: string;
      };
      if (!result.ok) {
        if (result.error === 'Već si prijavljen na ovaj termin.') {
          saveUserDisplayName(name);
          setJoinError(null);
          setIsJoined(true);
          setChatOpen(true);
          const refreshed = await resolveEventForDetailPage(event.id);
          if (refreshed) {
            setEvent(refreshed);
            setMessages(structuredClone(refreshed.messages));
          }
          return;
        }
        setJoinError(result.error ?? 'Prijava nije uspjela.');
        return;
      }
      saveUserDisplayName(name);
    } else {
      if (!name) {
        setJoinError('Upiši ime za prikaz.');
        return;
      }
    }

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
      authorName: name || 'Ti',
      authorInitials: (name || 'TI').slice(0, 2).toUpperCase(),
      authorAvatarColor: 'bg-blue-100',
      authorTextColor: 'text-blue-800',
      text: 'Hej ekipa, dolazim! 👋',
      timestamp: new Date().toISOString(),
      isSystem: false,
    };

    setJoinError(null);

    let baseMsgs = structuredClone(event.messages);
    if (court) {
      const refreshed = await resolveEventForDetailPage(event.id);
      if (refreshed) {
        setEvent(refreshed);
        baseMsgs = structuredClone(refreshed.messages);
      }
    }

    setMessages([...baseMsgs, welcomeMsg, joinMsg]);
    setIsJoined(true);
    setChatOpen(true);
  };

  const handleLeave = async () => {
    if (isPersistedCourtAppointment(event.id)) {
      const profile = getOrCreateUserProfile();
      leaveAppointment(event.id, profile.userId);
      const refreshed = await resolveEventForDetailPage(event.id);
      if (refreshed) {
        setEvent(refreshed);
        setMessages(structuredClone(refreshed.messages));
      }
    }
    setIsJoined(false);
    setChatOpen(false);
  };

  return (
    <div className="relative mx-auto min-h-dvh max-w-sm bg-slate-100 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-20 flex items-center border-b border-slate-200 bg-white px-2 py-2 pt-[max(0.25rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100"
          aria-label="Natrag"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </header>

      <div className="px-4 pb-6 pt-4">
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
          <h1 className="mb-3 pr-6 text-[1.05rem] font-normal leading-snug text-slate-900">
            {event.title}
          </h1>

          <dl className="mb-3 space-y-1.5 text-[0.88rem]">
            {(
              [
                ['Tip sporta', detailSportLabel(event)],
                ['Raspored', rangeStr],
                ['Trajanje', `${event.durationMinutes ?? 60} min`],
                [
                  'Igrači',
                  `min. ${detailMinPlayers(event)}, max. ${event.spotsTotal}`,
                ],
                ['Prijave', `${n} od ${event.spotsTotal} prijavljenih`],
              ] as const
            ).map(([label, value]) => (
              <div
                key={label}
                className="grid grid-cols-[110px_1fr] gap-x-2.5 gap-y-0.5"
              >
                <dt className="m-0 font-semibold text-slate-600">{label}</dt>
                <dd className="m-0 text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-3 border-t border-slate-200 pt-2.5">
            <h2 className="mb-1.5 text-[0.82rem] font-bold uppercase tracking-wide text-slate-700">
              Opis
            </h2>
            <p className="m-0 whitespace-pre-wrap text-[0.9rem] leading-[1.45] text-slate-700">
              {desc.length > 0 ? desc : 'Nema opisa.'}
            </p>
          </section>

          <section className="mt-3 border-t border-slate-200 pt-2.5">
            <h2 className="mb-1.5 text-[0.82rem] font-bold uppercase tracking-wide text-slate-700">
              Prijavljeni
            </h2>
            <ul className="m-0 list-disc pl-[1.1rem] text-[0.88rem] text-slate-700">
              {event.participants.length === 0 ? (
                <li className="list-none text-slate-500" style={{ marginLeft: '-1.1rem' }}>
                  Još nitko nije prijavljen.
                </li>
              ) : (
                event.participants.map((p) => (
                  <li key={p.id}>
                    {p.name}
                    {p.joinedAt ? ` · ${formatJoinedAtHr(p.joinedAt)}` : ''}
                  </li>
                ))
              )}
            </ul>
          </section>

          {full && !isJoined ? (
            <p className="mt-3.5 text-[0.9rem] font-semibold text-amber-700">
              Termin je popunjen.
            </p>
          ) : null}

          <div className="mt-3.5 flex flex-col gap-2.5 border-t border-slate-200 pt-3.5">
            {!isJoined && !full ? (
              <>
                <label className="flex flex-col gap-1 text-[0.85rem]">
                  <span className="font-semibold text-slate-700">Ime za prikaz</span>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setJoinError(null);
                    }}
                    maxLength={80}
                    placeholder="npr. Ana"
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                {joinError ? (
                  <p className="m-0 text-[0.85rem] font-medium text-rose-700" role="alert">
                    {joinError}
                  </p>
                ) : null}
                <button
                  type="button"
                  disabled={joinDisabled}
                  onClick={() => void handleJoin()}
                  className={`mt-1 rounded-lg py-2.5 text-[0.9rem] font-semibold ${
                    joinDisabled
                      ? 'cursor-not-allowed bg-slate-200 text-slate-400'
                      : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                  }`}
                >
                  Pridruži se terminu
                </button>
              </>
            ) : null}

            {isJoined ? (
              <>
                <p className="m-0 text-[0.88rem] text-emerald-700">Prijavljen si na ovaj termin.</p>
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="rounded-lg border border-slate-300 bg-white py-2.5 text-[0.9rem] font-semibold text-slate-800 hover:bg-slate-50"
                  >
                    Otvori chat
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleLeave()}
                    className="rounded-lg border border-slate-300 bg-white py-2 text-[0.85rem] font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Odjavi se
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <ChatPanel
        isOpen={chatOpen && isJoined}
        onClose={() => setChatOpen(false)}
        messages={messages}
        setMessages={setMessages}
        title="Chat termina"
        subtitle={event.title}
      />
    </div>
  );
}
