export interface TopBarProps {
  userInitials: string;
  notificationCount?: number;
}

export function TopBar({ userInitials, notificationCount = 2 }: TopBarProps) {
  return (
    <header className="flex items-center justify-between px-1 pt-2 pb-3">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight text-stone-900">Sportaj</span>
        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
          beta
        </span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-600 shadow-sm ring-1 ring-stone-200/80"
          aria-label="Obavijesti"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {notificationCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
          ) : null}
        </button>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white shadow-sm"
          aria-hidden
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
