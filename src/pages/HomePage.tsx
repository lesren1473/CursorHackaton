import { useMemo, useState } from 'react';
import { BottomNav, type BottomNavTab } from '../components/BottomNav';
import {
  countActiveFilters,
  EventFilters,
  type EventFiltersState,
} from '../components/EventFilters';
import { EventList } from '../components/EventList';
import { FABButton } from '../components/FABButton';
import { GreetingBanner } from '../components/GreetingBanner';
import { MapStrip } from '../components/MapStrip';
import { TopBar } from '../components/TopBar';
import { mockEvents } from '../mockData';
import {
  getGreeting,
  matchesCapacityFilter,
  matchesMaxDistanceKm,
  matchesWhenFilter,
} from '../utils/eventHelpers';

const USER_NAME = 'Tin';
const CITY = 'Zagrebu';

const defaultFilters: EventFiltersState = {
  sport: null,
  when: 'sve',
  maxDistanceKm: null,
  capacity: 'bilo_koji',
};

export function HomePage() {
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<EventFiltersState>(defaultFilters);
  const [savedEventIds, setSavedEventIds] = useState<Set<string>>(() => new Set());
  const [bottomTab, setBottomTab] = useState<BottomNavTab>('pocetna');

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const patchFilters = (patch: Partial<EventFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const filtered = useMemo(
    () =>
      mockEvents
        .filter((e) => !filters.sport || e.sport === filters.sport)
        .filter((e) => matchesWhenFilter(e, filters.when))
        .filter((e) => matchesMaxDistanceKm(e, filters.maxDistanceKm))
        .filter((e) => matchesCapacityFilter(e, filters.capacity))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [filters],
  );

  const greetingWord = getGreeting();

  const toggleSave = (id: string) => {
    setSavedEventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onJoin = (id: string) => {
    console.log('Prijavi se', id);
  };

  const onOpenMap = () => {
    console.log('Map view — uskoro');
  };

  return (
    <div className="relative mx-auto min-h-dvh max-w-sm pb-36">
      <div className="px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <TopBar userInitials="TK" notificationCount={2} />
        <div className="mt-4">
          <GreetingBanner
            greetingWord={greetingWord}
            name={USER_NAME}
            eventCount={filtered.length}
            city={CITY}
          />
        </div>
      </div>

      <div className="sticky top-0 z-40 border-b border-stone-200/90 bg-stone-100/95 px-4 py-2.5 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-stone-100/85">
        <EventFilters
          expanded={filtersExpanded}
          onExpandedChange={setFiltersExpanded}
          filters={filters}
          onFiltersChange={patchFilters}
          onOpenMap={onOpenMap}
          activeCount={activeFilterCount}
        />
      </div>

      <main className="space-y-4 px-4 pb-4 pt-4">
        <MapStrip events={filtered} />
        <section aria-label="Lista evenata">
          <h2 className="mb-2 text-sm font-semibold text-stone-800">Preporučeno za tebe</h2>
          <EventList
            events={filtered}
            savedEventIds={savedEventIds}
            onToggleSave={toggleSave}
            onJoin={onJoin}
          />
        </section>
      </main>
      <FABButton />
      <BottomNav active={bottomTab} onChange={setBottomTab} />
    </div>
  );
}
