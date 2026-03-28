export type BottomNavTab = 'pocetna' | 'mapa' | 'moji' | 'profil';

export interface BottomNavProps {
  active: BottomNavTab;
  onChange?: (tab: BottomNavTab) => void;
}

const items: { id: BottomNavTab; label: string }[] = [
  { id: 'pocetna', label: 'Početna' },
  { id: 'mapa', label: 'Mapa' },
  { id: 'moji', label: 'Moji eventi' },
  { id: 'profil', label: 'Profil' },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200 bg-white/95 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Glavna navigacija"
    >
      <div className="mx-auto flex max-w-sm justify-around px-1">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange?.(item.id)}
              className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[11px] font-medium ${
                isActive ? 'text-stone-900' : 'text-stone-500'
              }`}
            >
              <span
                className={`h-1 w-8 rounded-full ${isActive ? 'bg-stone-900' : 'bg-transparent'}`}
                aria-hidden
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
