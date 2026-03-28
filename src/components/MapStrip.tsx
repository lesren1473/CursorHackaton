import type { Event } from '../types';
import { sportColors } from '../constants/sportConfig';

export interface MapStripProps {
  events: Event[];
}

/** Abstract pin positions for placeholder map */
const PIN_LAYOUT = [
  { x: 52, y: 38 },
  { x: 78, y: 62 },
  { x: 140, y: 44 },
  { x: 168, y: 72 },
  { x: 210, y: 52 },
];

export function MapStrip({ events }: MapStripProps) {
  const pins = events.slice(0, PIN_LAYOUT.length);

  const openMap = () => {
    console.log('Otvori mapu');
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm ring-1 ring-stone-200/80">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-stone-900">U blizini</p>
          <p className="text-xs text-stone-500">Zagreb i okolica</p>
        </div>
        <button
          type="button"
          onClick={openMap}
          className="shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Otvori mapu →
        </button>
      </div>
      <svg
        viewBox="0 0 280 100"
        className="mt-2 h-[100px] w-full rounded-xl bg-gradient-to-b from-emerald-50/90 to-stone-100"
        role="img"
        aria-label="Pregled karte"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="0.4" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <path
          d="M0 78 Q70 60 140 72 T280 65"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        {pins.map((ev, i) => {
          const pos = PIN_LAYOUT[i] ?? PIN_LAYOUT[0];
          const color = sportColors[ev.sport].pin;
          return (
            <g key={ev.id} transform={`translate(${pos.x}, ${pos.y})`}>
              <circle r="14" fill={color} opacity="0.2" />
              <circle r="6" fill={color} stroke="white" strokeWidth="2" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
