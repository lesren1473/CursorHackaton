import type { Event } from '../types';
import { EventCard } from './EventCard';

export interface EventListProps {
  events: Event[];
  savedEventIds: Set<string>;
  onToggleSave: (eventId: string) => void;
  onJoin: (eventId: string) => void;
}

export function EventList({ events, savedEventIds, onToggleSave, onJoin }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-10 text-center">
        <p className="text-sm font-medium text-stone-600">Nema evenata za ovaj filter.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          isSaved={savedEventIds.has(event.id)}
          onToggleSave={onToggleSave}
          onJoin={onJoin}
        />
      ))}
    </div>
  );
}
