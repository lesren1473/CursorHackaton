import type { Event, SkillLevel } from '../types';
import { sportColors, sportLabels } from '../constants/sportConfig';
import { getSpotsStatus, getTimeLabel, getUrgentHoursLabel } from '../utils/eventHelpers';

const skillLabels: Record<SkillLevel, string> = {
  svi: 'Svi',
  početnici: 'Početnici',
  srednja: 'Srednja',
  napredni: 'Napredni',
};

export interface EventCardProps {
  event: Event;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onJoin: (eventId: string) => void;
}

export function EventCard({ event, isSaved, onToggleSave, onJoin }: EventCardProps) {
  const left = event.spotsTotal - event.spotsTaken;
  const spots = getSpotsStatus(left);
  const urgentLabel = getUrgentHoursLabel(event);
  const participants = event.participants;
  const shown = participants.slice(0, 3);
  const extra = participants.length - shown.length;

  const spotsClass =
    spots.tone === 'green'
      ? 'text-emerald-700'
      : spots.tone === 'amber'
        ? 'text-amber-700'
        : 'text-rose-700';

  const joinDisabled = left <= 0;

  return (
    <article className="rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-stone-200/80">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold ${sportColors[event.sport].badge}`}
        >
          {sportLabels[event.sport]}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {urgentLabel ? (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
              {urgentLabel}
            </span>
          ) : null}
          <span className="text-xs font-medium text-stone-500">{getTimeLabel(event)}</span>
        </div>
      </div>

      <h3 className="mt-2 text-base font-semibold leading-snug text-stone-900">{event.title}</h3>
      <p className="mt-0.5 text-sm text-stone-600">{event.location}</p>
      <p className="mt-0.5 text-xs text-stone-500">{event.distanceKm.toFixed(1)} km • {skillLabels[event.skillLevel]}</p>

      <p className={`mt-2 text-sm font-semibold ${spotsClass}`}>{spots.label}</p>

      <p className="mt-1 text-sm font-medium text-stone-800">
        {event.pricePerPerson === 0 ? (
          <span className="text-emerald-700">Besplatno</span>
        ) : (
          <span>{event.pricePerPerson} € / osoba</span>
        )}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {shown.map((p) => (
            <div
              key={p.id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold shadow-sm"
              style={{ backgroundColor: p.avatarColor, color: p.textColor }}
              title={p.name}
            >
              {p.initials}
            </div>
          ))}
          {extra > 0 ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-stone-200 text-[10px] font-bold text-stone-700 shadow-sm">
              +{extra}
            </div>
          ) : null}
        </div>
        <span className="text-xs text-stone-500">
          Voditelj: <span className="font-medium text-stone-700">{event.organizer.name}</span>
        </span>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          disabled={joinDisabled}
          onClick={() => onJoin(event.id)}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
            joinDisabled
              ? 'cursor-not-allowed bg-stone-200 text-stone-400'
              : 'bg-stone-900 text-white hover:bg-stone-800'
          }`}
        >
          Prijavi se
        </button>
        <button
          type="button"
          onClick={() => onToggleSave(event.id)}
          className={`rounded-xl px-4 py-2.5 text-sm font-semibold ring-1 transition-colors ${
            isSaved
              ? 'bg-amber-50 text-amber-900 ring-amber-200'
              : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50'
          }`}
        >
          {isSaved ? 'Spremljeno' : 'Spremi'}
        </button>
      </div>
    </article>
  );
}
