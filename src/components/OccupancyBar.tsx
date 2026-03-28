export interface OccupancyBarProps {
  percent: number;
}

export function OccupancyBar({ percent }: OccupancyBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
      <div
        className="h-full rounded-full bg-emerald-500 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
