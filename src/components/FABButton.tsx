export interface FABButtonProps {
  label?: string;
}

export function FABButton({ label = 'Objavi event' }: FABButtonProps) {
  const handleClick = () => {
    console.log('Objavi event');
  };

  return (
    <div className="fixed bottom-[calc(3.5rem+max(0.5rem,env(safe-area-inset-bottom)))] left-0 right-0 z-30 px-4">
      <div className="mx-auto max-w-sm">
        <button
          type="button"
          onClick={handleClick}
          className="w-full rounded-2xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.99] transition-transform"
        >
          {label}
        </button>
      </div>
    </div>
  );
}
