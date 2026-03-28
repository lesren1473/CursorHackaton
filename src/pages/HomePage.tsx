import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreateCourtAppointmentModal } from '../components/CreateCourtAppointmentModal';
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
import { loadMapCourtEventsForHome } from '../mapCourt/eventBridge';
import type { Event } from '../types';
import {
  getGreeting,
  matchesCapacityFilter,
  matchesMaxDistanceKm,
  matchesWhenFilter,
} from '../utils/eventHelpers';
import { openLegacyMapPage } from '../utils/legacyMapUrl';

const CITY = 'Zagrebu';

/** Minimalno trajanje splasha (ms) — vizualni „loading“ ~0,7 s */
const HOME_SPLASH_MIN_MS = 700;

function homeSplashInitialPhase(): 'on' | 'off' {
  if (typeof window === 'undefined') {
    return 'on';
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
}

const defaultFilters: EventFiltersState = {
  sport: null,
  when: 'sve',
  maxDistanceKm: null,
  capacity: 'bilo_koji',
};

/** How much the background moves vs scroll (0–1). Lower = slower. Negative sign = opposite to scroll (depth). */
const HOME_BG_PARALLAX = 0.32;
/** Extra slab above/below viewport so parallax never uncovers body (vh + px for long pages). */
const HOME_BG_PARALLAX_PAD_VH = 120;
const HOME_BG_PARALLAX_PAD_PX = 2400;

/** Full-viewport green scene behind the home column (gradients + clipped shapes). */
function HomePageBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const apply = () => {
      rafRef.current = null;
      const y = scrollRef.current;
      el.style.transform = `translate3d(0, ${-y * HOME_BG_PARALLAX}px, 0)`;
    };

    const onScroll = () => {
      scrollRef.current = window.scrollY;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(apply);
      }
    };

    scrollRef.current = window.scrollY;
    apply();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      el.style.transform = '';
    };
  }, []);

  const padVh = HOME_BG_PARALLAX_PAD_VH;
  const padPx = HOME_BG_PARALLAX_PAD_PX;
  const slabMinH = `calc(100vh + ${padVh * 2}vh + ${padPx * 2}px)`;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {/* Tall moving slab: fixed mask clips to screen; extra height avoids white gaps while parallax shifts. */}
      <div
        ref={rootRef}
        className="absolute left-0 right-0 w-full will-change-transform"
        style={{
          top: `calc(-${padVh}vh - ${padPx}px)`,
          minHeight: slabMinH,
        }}
      >
      {/* Base wash — cool mint into warm leaf */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50/95 to-[#ecfdf3]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-100/40 to-lime-100/50" />

      {/* Diagonal “field” slab — top right */}
      <div
        className="absolute -right-[20%] -top-24 h-[min(78vh,520px)] w-[min(140%,420px)] rotate-[11deg] bg-gradient-to-bl from-emerald-400/45 via-teal-500/28 to-transparent"
        style={{
          clipPath: 'polygon(12% 0%, 100% 0%, 100% 100%, 0% 82%)',
        }}
      />
      {/* Counter-angle — bottom sweep */}
      <div
        className="absolute -bottom-8 -left-[12%] h-[42%] w-[118%] -rotate-[5deg] bg-gradient-to-tr from-lime-200/50 via-emerald-300/35 to-transparent"
        style={{
          clipPath: 'polygon(0% 18%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      />
      {/* Narrow accent stripe */}
      <div
        className="absolute left-0 top-[22%] h-[38%] w-full -skew-y-6 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-400/12"
        style={{ clipPath: 'polygon(0 0, 100% 12%, 100% 88%, 0 100%)' }}
      />

      {/* Soft glow orbs */}
      <div className="absolute -left-24 top-[18%] h-80 w-80 rounded-full bg-emerald-300/35 blur-3xl motion-reduce:opacity-60" />
      <div className="absolute -right-20 bottom-[26%] h-72 w-72 rounded-full bg-teal-400/30 blur-3xl motion-reduce:opacity-60" />
      <div className="absolute left-1/3 top-[55%] h-56 w-56 -translate-x-1/2 rounded-full bg-lime-200/25 blur-2xl motion-reduce:opacity-70" />

      {/* Subtle dot lattice */}
      <div
        className="absolute inset-0 opacity-[0.45] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgb(5 150 105 / 0.11) 0.55px, transparent 0.55px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* Stadium-ish arc hint */}
      <svg
        className="absolute left-1/2 top-0 h-[min(42vh,280px)] w-[min(140%,520px)] -translate-x-1/2 text-emerald-600/[0.09]"
        viewBox="0 0 520 160"
        preserveAspectRatio="none"
        fill="currentColor"
      >
        <ellipse cx="260" cy="-20" rx="340" ry="130" />
      </svg>
      </div>
    </div>
  );
}

export function HomePage() {
  const { userDisplayName } = useAuth();
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [filters, setFilters] = useState<EventFiltersState>(defaultFilters);
  const [courtEvents, setCourtEvents] = useState<Event[]>([]);
  const [courtLoading, setCourtLoading] = useState(true);
  const [courtError, setCourtError] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const mountTimeRef = useRef(Date.now());
  const [splashPhase, setSplashPhase] = useState<'on' | 'fading' | 'off'>(() =>
    homeSplashInitialPhase() === 'off' ? 'off' : 'on',
  );

  useEffect(() => {
    let cancelled = false;
    setCourtLoading(true);
    setCourtError(false);
    loadMapCourtEventsForHome()
      .then((list) => {
        if (!cancelled) {
          setCourtEvents(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourtEvents([]);
          setCourtError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCourtLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (courtLoading) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSplashPhase('off');
      return;
    }
    const elapsed = Date.now() - mountTimeRef.current;
    const remaining = Math.max(0, HOME_SPLASH_MIN_MS - elapsed);
    const startFade = window.setTimeout(() => {
      setSplashPhase('fading');
    }, remaining);
    const remove = window.setTimeout(() => {
      setSplashPhase('off');
    }, remaining + 280);
    return () => {
      window.clearTimeout(startFade);
      window.clearTimeout(remove);
    };
  }, [courtLoading]);

  const refreshCourtEventsQuiet = useCallback(() => {
    loadMapCourtEventsForHome()
      .then((list) => setCourtEvents(list))
      .catch(() => {});
  }, []);

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const patchFilters = (patch: Partial<EventFiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const filtered = useMemo(
    () =>
      courtEvents
        .filter((e) => !filters.sport || e.sport === filters.sport)
        .filter((e) => matchesWhenFilter(e, filters.when))
        .filter((e) => matchesMaxDistanceKm(e, filters.maxDistanceKm))
        .filter((e) => matchesCapacityFilter(e, filters.capacity))
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [courtEvents, filters],
  );

  const greetingWord = getGreeting();

  const onOpenMap = () => {
    openLegacyMapPage();
  };

  return (
    <>
      <HomePageBackground />
      <div className="relative z-10 mx-auto min-h-dvh max-w-sm pb-28">
      {splashPhase !== 'off' ? (
        <div
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 via-stone-50 to-stone-100 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
            splashPhase === 'fading' ? 'pointer-events-none opacity-0' : 'opacity-100'
          }`}
          aria-hidden
        >
          <div className="motion-safe:animate-home-loader-glow absolute h-40 w-40 rounded-full bg-emerald-400/25 blur-3xl motion-reduce:animate-none" />
          <div className="relative flex flex-col items-center gap-6">
            <p className="bg-gradient-to-r from-stone-900 via-emerald-800 to-stone-900 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              Sportaj
            </p>
            <div className="flex h-10 items-end justify-center gap-1.5" aria-label="Učitavanje">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 origin-bottom rounded-full bg-gradient-to-t from-emerald-600 to-teal-400 motion-safe:animate-home-loader-bar motion-reduce:h-8 motion-reduce:animate-none"
                  style={{
                    animationDelay: `${i * 120}ms`,
                    height: '2rem',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={
          splashPhase === 'off'
            ? 'motion-safe:animate-home-reveal motion-reduce:opacity-100'
            : 'opacity-0'
        }
      >
      <div className="px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <TopBar notificationCount={2} />
        <div className="mt-4">
          <GreetingBanner
            greetingWord={greetingWord}
            name={userDisplayName}
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
        <MapStrip events={filtered} onOpenMap={onOpenMap} />
        <section aria-label="Nadolazeći termini s karte">
          <h2 className="text-sm font-semibold text-stone-800">Uskoro</h2>
          <p className="mt-0.5 text-xs text-stone-500">
            Isti nadolazeći termini kao na karti javnih igrališta (do 6 u sljedeća 3 dana).
          </p>
          {courtLoading ? (
            <div className="mt-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-4 py-8 text-center text-sm text-stone-500">
              Učitavanje termina s karte…
            </div>
          ) : courtError ? (
            <div className="mt-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50/80 px-4 py-8 text-center text-sm text-rose-800">
              Nije moguće učitati termine. Otvori kartu ili pokušaj ponovno.
            </div>
          ) : (
            <div className="mt-3">
              <EventList events={filtered} />
            </div>
          )}
        </section>
      </main>
      <FABButton onClick={() => setCreateModalOpen(true)} />
      <CreateCourtAppointmentModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={refreshCourtEventsQuiet}
      />
      </div>
    </div>
    </>
  );
}
