export interface GreetingBannerProps {
  greetingWord: 'jutro' | 'dan' | 'večer';
  name: string;
  eventCount: number;
  city: string;
}

export function GreetingBanner({ greetingWord, name, eventCount, city }: GreetingBannerProps) {
  const label =
    eventCount === 1 ? '1 event' : `${eventCount} evenata`;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 px-4 py-3.5 text-white shadow-md">
      <p className="text-[15px] leading-snug">
        <span className="font-medium text-stone-200">Dobro {greetingWord},</span>{' '}
        <span className="font-semibold">{name}!</span>
      </p>
      <p className="mt-1 text-sm text-stone-300">
        {label} u {city}
      </p>
    </div>
  );
}
