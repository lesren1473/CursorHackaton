import type { Organizer } from '../types';

export interface ParticipantListProps {
  participants: Organizer[];
  onAvatarClick?: (organizer: Organizer) => void;
}

export function ParticipantList({ participants, onAvatarClick }: ParticipantListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {participants.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onAvatarClick?.(p)}
          className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold shadow-md ring-1 ring-stone-200 transition-transform active:scale-95"
          style={{ backgroundColor: p.avatarColor, color: p.textColor }}
          title={p.name}
        >
          {p.initials}
        </button>
      ))}
    </div>
  );
}
