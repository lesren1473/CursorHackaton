import type {
  CapacityFilter,
  DistancePreset,
  Sport,
  WhenFilter,
} from '../types';
import { allSports, sportIcons, sportLabels } from '../constants/sportConfig';

export interface EventFiltersState {
  sport: Sport | null;
  when: WhenFilter;
  maxDistanceKm: DistancePreset;
  capacity: CapacityFilter;
}

export interface EventFiltersProps {
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  filters: EventFiltersState;
  onFiltersChange: (patch: Partial<EventFiltersState>) => void;
  onOpenMap: () => void;
  activeCount: number;
}

const whenOptions: { id: WhenFilter; label: string }[] = [
  { id: 'sve', label: 'Bilo kada' },
  { id: 'danas', label: 'Danas' },
  { id: 'sutra', label: 'Sutra' },
  { id: 'ovaj tjedan', label: 'Ovaj tjedan' },
];

const distanceOptions: { value: DistancePreset; label: string }[] = [
  { value: null, label: 'Bilo gdje' },
  { value: 3, label: 'Do 3 km' },
  { value: 5, label: 'Do 5 km' },
  { value: 10, label: 'Do 10 km' },
];

const capacityOptions: { id: CapacityFilter; label: string; title: string }[] = [
  { id: 'bilo_koji', label: 'Bilo koji', title: 'Sve veličine grupa' },
  { id: 'mali', label: 'Mali', title: 'Do 6 igrača ukupno' },
  { id: 'srednji', label: 'Srednji', title: '7–12 igrača' },
  { id: 'veliki', label: 'Veliki', title: '13 ili više igrača' },
];

function chipClass(active: boolean) {
  return `rounded-full px-3 py-1.5 text-xs font-medium transition-colors shrink-0 ${
    active ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 ring-1 ring-stone-200'
  }`;
}

function sectionLabel(text: string) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
      {text}
    </p>
  );
}

export function EventFilters({
  expanded,
  onExpandedChange,
  filters,
  onFiltersChange,
  onOpenMap,
  activeCount,
}: EventFiltersProps) {
  const toggleExpanded = () => onExpandedChange(!expanded);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleExpanded}
          className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl py-2.5 pl-3 pr-2 text-sm font-semibold transition-colors ${
            expanded || activeCount > 0
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-800 ring-1 ring-stone-200'
          }`}
          aria-expanded={expanded}
        >
          <svg className="h-4 w-4 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          <span className="truncate">Napredni filteri</span>
          {activeCount > 0 ? (
            <span
              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${
                expanded || activeCount > 0 ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {activeCount}
            </span>
          ) : null}
          <svg
            className={`ml-auto h-4 w-4 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <button
          type="button"
          onClick={onOpenMap}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
          aria-label="Otvori kartu (uskoro)"
          title="Karta"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        </button>
      </div>

      {expanded ? (
        <div className="space-y-4 rounded-2xl bg-white p-3.5 ring-1 ring-stone-200/80 shadow-sm">
          <div>
            {sectionLabel('Sport')}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onFiltersChange({ sport: null })}
                className={chipClass(filters.sport === null)}
              >
                Svi sportovi
              </button>
              {allSports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => onFiltersChange({ sport })}
                  className={`flex items-center gap-1 ${chipClass(filters.sport === sport)}`}
                >
                  <span aria-hidden>{sportIcons[sport]}</span>
                  {sportLabels[sport]}
                </button>
              ))}
            </div>
          </div>

          <div>
            {sectionLabel('Kada')}
            <div className="flex flex-wrap gap-2">
              {whenOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFiltersChange({ when: opt.id })}
                  className={chipClass(filters.when === opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            {sectionLabel('Približna udaljenost')}
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => onFiltersChange({ maxDistanceKm: opt.value })}
                  className={chipClass(filters.maxDistanceKm === opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            {sectionLabel('Broj igrača (kapacitet)')}
            <div className="flex flex-wrap gap-2">
              {capacityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onFiltersChange({ capacity: opt.id })}
                  className={chipClass(filters.capacity === opt.id)}
                  title={opt.title}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {activeCount > 0 ? (
            <button
              type="button"
              onClick={() =>
                onFiltersChange({
                  sport: null,
                  when: 'sve',
                  maxDistanceKm: null,
                  capacity: 'bilo_koji',
                })
              }
              className="w-full rounded-xl py-2 text-center text-sm font-medium text-stone-600 underline decoration-stone-300 underline-offset-2 hover:text-stone-900"
            >
              Poništi sve filtere
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function countActiveFilters(filters: EventFiltersState): number {
  let n = 0;
  if (filters.sport !== null) n += 1;
  if (filters.when !== 'sve') n += 1;
  if (filters.maxDistanceKm !== null) n += 1;
  if (filters.capacity !== 'bilo_koji') n += 1;
  return n;
}
