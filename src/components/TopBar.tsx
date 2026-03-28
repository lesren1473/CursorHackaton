import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export interface TopBarProps {
  notificationCount?: number;
}

export function TopBar({ notificationCount = 2 }: TopBarProps) {
  const { userInitials, session, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

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

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white shadow-sm ring-2 ring-transparent hover:ring-stone-300"
            aria-label="Moj profil"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            {userInitials}
          </button>

          {menuOpen ? (
            <div
              className="absolute right-0 top-full z-50 mt-1.5 min-w-[200px] rounded-xl border border-stone-200 bg-white py-1 shadow-lg ring-1 ring-stone-200/80"
              role="menu"
            >
              <p className="truncate px-3 py-2 text-xs text-stone-500" title={session?.email}>
                {session?.email}
              </p>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                <svg className="h-4 w-4 text-stone-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Odjava
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
