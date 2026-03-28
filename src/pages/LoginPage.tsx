import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Upiši e-mail adresu.');
      return;
    }
    if (!password.trim()) {
      setError('Upiši lozinku.');
      return;
    }
    const ok = login(email.trim(), password);
    if (ok) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-50/80 to-stone-100 px-4 py-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 motion-safe:animate-landing-bg-shimmer bg-[length:200%_200%] bg-gradient-to-br from-emerald-200/25 via-transparent to-teal-200/20 opacity-80 motion-reduce:hidden"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center motion-safe:animate-landing-hero motion-reduce:opacity-100">
          <div className="relative inline-block">
            <p className="bg-gradient-to-r from-stone-900 via-emerald-900 to-stone-900 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent">
              Sportaj
            </p>
            <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
              <span className="h-[3px] w-[78%] origin-center rounded-full bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.45)] motion-safe:animate-landing-line motion-reduce:scale-x-100 motion-reduce:opacity-100" />
            </div>
          </div>
          <p className="mt-3 text-sm font-medium text-stone-500">Prijavi se za nastavak</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/95 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] ring-1 ring-stone-200/90 backdrop-blur-sm motion-safe:animate-landing-card motion-reduce:opacity-100"
        >
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              E-mail
            </span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ti@primjer.hr"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none ring-stone-400 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:ring-2"
            />
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Lozinka
            </span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none ring-stone-400 placeholder:text-stone-400 focus:border-emerald-500 focus:bg-white focus:ring-2"
            />
          </label>

          {error ? (
            <p className="mt-3 text-sm font-medium text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-stone-900 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
          >
            Prijavi se
          </button>
        </form>
      </div>
    </div>
  );
}
