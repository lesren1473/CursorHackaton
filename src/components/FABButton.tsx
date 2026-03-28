export interface FABButtonProps {
  label?: string;
  onClick?: () => void;
}

export function FABButton({ label = 'Objavi event', onClick }: FABButtonProps) {
  return (
    <div className="fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-0 right-0 z-30 px-4">
      <div className="mx-auto max-w-sm">
        <button
          type="button"
          onClick={onClick}
          className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.99] transition-transform"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
