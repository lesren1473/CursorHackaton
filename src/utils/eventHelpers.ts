import type { CapacityFilter, Event, TimeFilter, WhenFilter } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

export function formatLocalDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseEventDateTime(event: Event): Date {
  const [y, m, day] = event.date.split('-').map(Number);
  const [h, min] = event.startTime.split(':').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1, h ?? 0, min ?? 0, 0, 0);
}

/** Monday 00:00 to Sunday 23:59:59 in local time */
export function isInCurrentWeek(dateStr: string, now = new Date()): boolean {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const day = now.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + mondayOffset);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return target >= weekStart && target <= weekEnd;
}

export function matchesTimeFilter(event: Event, filter: TimeFilter, now = new Date()): boolean {
  const todayStr = formatLocalDate(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatLocalDate(tomorrow);

  if (filter === 'danas') return event.date === todayStr;
  if (filter === 'sutra') return event.date === tomorrowStr;
  return isInCurrentWeek(event.date, now);
}

export function matchesWhenFilter(event: Event, filter: WhenFilter, now = new Date()): boolean {
  if (filter === 'sve') return true;
  return matchesTimeFilter(event, filter, now);
}

export function matchesMaxDistanceKm(
  event: Event,
  maxKm: number | null,
): boolean {
  if (maxKm === null) return true;
  return event.distanceKm <= maxKm;
}

export function matchesCapacityFilter(
  event: Event,
  capacity: CapacityFilter,
): boolean {
  if (capacity === 'bilo_koji') return true;
  const n = event.spotsTotal;
  if (capacity === 'mali') return n <= 6;
  if (capacity === 'srednji') return n >= 7 && n <= 12;
  return n >= 13;
}

export function getGreeting(now = new Date()): 'jutro' | 'dan' | 'večer' {
  const h = now.getHours();
  if (h < 12) return 'jutro';
  if (h < 18) return 'dan';
  return 'večer';
}

export type SpotsTone = 'green' | 'amber' | 'red';

export function getSpotsStatus(left: number): {
  tone: SpotsTone;
  label: string;
} {
  if (left <= 0) return { tone: 'red', label: 'Popunjeno' };
  if (left <= 2) return { tone: 'amber', label: `Još ${left} mjesta!` };
  return { tone: 'green', label: `${left} slobodnih mjesta` };
}

/** Hours until start; negative if already started */
export function hoursUntilEvent(event: Event, now = new Date()): number {
  const start = parseEventDateTime(event);
  return (start.getTime() - now.getTime()) / (1000 * 60 * 60);
}

/** "za Xh" for urgent pill when event is today and within next few hours */
export function getUrgentHoursLabel(event: Event, now = new Date()): string | null {
  if (!event.isUrgent) return null;
  const h = hoursUntilEvent(event, now);
  if (h <= 0) return 'uskoro';
  const rounded = Math.max(1, Math.round(h));
  return `za ${rounded}h`;
}

export function getTimeLabel(event: Event): string {
  return `${event.startTime}`;
}
