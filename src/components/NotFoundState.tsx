export interface NotFoundStateProps {
  onBack: () => void;
}

export function NotFoundState({ onBack }: NotFoundStateProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-lg font-semibold text-stone-900">Event nije pronađen</p>
      <p className="text-sm text-stone-600">Provjeri link ili se vrati na početnu.</p>
      <button
        type="button"
        onClick={onBack}
        className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white"
      >
        Natrag na početnu
      </button>
    </div>
  );
}
