import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  addAppointment,
  combineDateHourMinuteToIso,
} from '../appointments.js';
import { getSuggestedSportsForCourtType } from '../courtSports.js';
import {
  ensureCourtLocationsLoaded,
  type MergedLocation,
} from '../mapCourt/eventBridge';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function defaultStartFields() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return {
    startDate: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    startHour: String(d.getHours()),
    startMinute: String(d.getMinutes()),
  };
}

export interface CreateCourtAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  /** Nakon uspješnog spremanja u isti storage kao karta */
  onCreated?: () => void;
}

export function CreateCourtAppointmentModal({
  open,
  onClose,
  onCreated,
}: CreateCourtAppointmentModalProps) {
  const [locations, setLocations] = useState<MergedLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [locationsError, setLocationsError] = useState(false);

  const [locationObjectId, setLocationObjectId] = useState('');
  const [title, setTitle] = useState('');
  const [sportType, setSportType] = useState('');
  const [minPlayers, setMinPlayers] = useState('4');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('18');
  const [startMinute, setStartMinute] = useState('0');
  const [durationMinutes, setDurationMinutes] = useState('60');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedLocation = useMemo(
    () => locations.find((l) => String(l.objectId) === locationObjectId),
    [locations, locationObjectId],
  );

  const sportSuggestions = useMemo(
    () => getSuggestedSportsForCourtType(selectedLocation?.objectType ?? ''),
    [selectedLocation?.objectType],
  );

  const sportDatalistId = useId();

  const resetDefaults = useCallback((locs: MergedLocation[]) => {
    const start = defaultStartFields();
    setStartDate(start.startDate);
    setStartHour(start.startHour);
    setStartMinute(start.startMinute);
    setTitle('');
    setMinPlayers('4');
    setMaxPlayers('10');
    setDurationMinutes('60');
    setDescription('');
    setFormError(null);
    if (locs.length > 0) {
      const first = locs[0];
      setLocationObjectId(String(first.objectId));
      const sug = getSuggestedSportsForCourtType(first.objectType);
      setSportType(sug[0] ?? '');
    } else {
      setLocationObjectId('');
      setSportType('');
    }
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }
    let cancelled = false;
    setLocationsLoading(true);
    setLocationsError(false);
    ensureCourtLocationsLoaded()
      .then((merged) => {
        if (!cancelled) {
          setLocations(merged);
          resetDefaults(merged);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLocationsError(true);
          setLocations([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLocationsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [open, resetDefaults]);

  /** Kao na karti: pri promjeni igrališta predloži prvi sport za taj tip objekta. */
  useEffect(() => {
    if (!locationObjectId || !selectedLocation) {
      return;
    }
    const sug = getSuggestedSportsForCourtType(selectedLocation.objectType);
    if (sug.length > 0) {
      setSportType(sug[0]);
    }
  }, [locationObjectId, selectedLocation?.objectId, selectedLocation?.objectType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const locId = Number.parseInt(locationObjectId, 10);
    if (!Number.isFinite(locId)) {
      setFormError('Odaberi javno igralište.');
      return;
    }

    const t = title.trim();
    const s = sportType.trim();
    const minP = Number.parseInt(minPlayers, 10);
    const maxP = Number.parseInt(maxPlayers, 10);
    const dur = Number.parseInt(durationMinutes, 10);
    const desc = description.trim();

    if (!t || !s || !startDate || startHour.trim() === '' || startMinute.trim() === '') {
      setFormError('Popuni obavezna polja.');
      return;
    }

    if (!Number.isFinite(minP) || !Number.isFinite(maxP)) {
      setFormError('Broj igrača mora biti valjan.');
      return;
    }

    if (minP < 1 || maxP < 1) {
      setFormError('Min. i max. igrača moraju biti najmanje 1.');
      return;
    }

    if (minP > maxP) {
      setFormError('Min. igrača ne smije biti veći od max. igrača.');
      return;
    }

    if (!Number.isFinite(dur) || dur < 15) {
      setFormError('Trajanje mora biti najmanje 15 minuta.');
      return;
    }

    const startIso = combineDateHourMinuteToIso(startDate, startHour, startMinute);
    if (!startIso) {
      setFormError(
        'Datum i vrijeme nisu valjani. Sati moraju biti 0–23, minute 0–59.',
      );
      return;
    }

    addAppointment({
      locationObjectId: locId,
      title: t,
      sportType: s,
      minPlayers: minP,
      maxPlayers: maxP,
      startIso,
      durationMinutes: dur,
      description: desc,
    });

    onCreated?.();
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[45] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-appointment-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/45"
        aria-label="Zatvori"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(90dvh,640px)] w-full max-w-md flex-col rounded-t-2xl border border-stone-200 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.2)] sm:rounded-[14px]">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3">
          <h2
            id="create-appointment-title"
            className="text-base font-semibold text-stone-900"
          >
            Novi termin
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 text-lg text-stone-700 hover:bg-stone-200"
            aria-label="Zatvori"
          >
            ×
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {locationsLoading ? (
            <p className="text-sm text-stone-500">Učitavanje igrališta…</p>
          ) : locationsError ? (
            <p className="text-sm text-rose-700">
              Nije moguće učitati lokacije. Otvori kartu ili pokušaj ponovno.
            </p>
          ) : (
            <form className="flex flex-col gap-2.5" onSubmit={handleSubmit} noValidate>
              <label className="flex flex-col gap-1 text-[0.85rem]">
                <span className="font-semibold text-stone-700">Javno igralište</span>
                <span className="text-[0.75rem] font-normal text-stone-500">
                  Isto polje kao termin s karte — odaberi lokaciju pina.
                </span>
                <select
                  required
                  value={locationObjectId}
                  onChange={(e) => setLocationObjectId(e.target.value)}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                >
                  <option value="" disabled>
                    Odaberi…
                  </option>
                  {locations.map((l) => (
                    <option key={l.objectId} value={String(l.objectId)}>
                      {l.address.trim() || `OBJECTID ${l.objectId}`}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-[0.85rem]">
                <span className="font-semibold text-stone-700">Naslov</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="npr. Rekreativna utakmica"
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="flex flex-col gap-1 text-[0.85rem]">
                <span className="font-semibold text-stone-700">Tip sporta</span>
                <span className="text-[0.75rem] font-normal text-stone-500">
                  Predlošci ovise o tipu igrališta; možeš i sam upisati.
                </span>
                <input
                  type="text"
                  value={sportType}
                  onChange={(e) => setSportType(e.target.value)}
                  required
                  maxLength={80}
                  list={sportDatalistId}
                  placeholder="Odaberi s popisa ili upiši"
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
                <datalist id={sportDatalistId}>
                  {sportSuggestions.map((sport) => (
                    <option key={sport} value={sport} />
                  ))}
                </datalist>
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-[0.85rem]">
                  <span className="font-semibold text-stone-700">Min. igrača</span>
                  <input
                    type="number"
                    value={minPlayers}
                    onChange={(e) => setMinPlayers(e.target.value)}
                    required
                    min={1}
                    max={999}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[0.85rem]">
                  <span className="font-semibold text-stone-700">Max. igrača</span>
                  <input
                    type="number"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    required
                    min={1}
                    max={999}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <label className="flex flex-col gap-1 text-[0.85rem]">
                  <span className="font-semibold text-stone-700">Datum početka</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                <div className="flex flex-col gap-1 text-[0.85rem]">
                  <span className="font-semibold text-stone-700">
                    Vrijeme (24 h, sati 0–23)
                  </span>
                  <div
                    className="flex items-center gap-1.5"
                    role="group"
                    aria-label="Vrijeme u 24-satnom obliku"
                  >
                    <input
                      type="number"
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      required
                      min={0}
                      max={23}
                      step={1}
                      inputMode="numeric"
                      aria-label="Sati"
                      className="w-14 rounded-lg border border-stone-300 bg-white px-1 py-2 text-center text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    />
                    <span className="font-semibold text-stone-600" aria-hidden>
                      :
                    </span>
                    <input
                      type="number"
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      required
                      min={0}
                      max={59}
                      step={1}
                      inputMode="numeric"
                      aria-label="Minute"
                      className="w-14 rounded-lg border border-stone-300 bg-white px-1 py-2 text-center text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                    />
                  </div>
                </div>
              </div>

              <label className="flex flex-col gap-1 text-[0.85rem]">
                <span className="font-semibold text-stone-700">Trajanje (minute)</span>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  required
                  min={15}
                  max={720}
                  step={5}
                  className="rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="flex flex-col gap-1 text-[0.85rem]">
                <span className="font-semibold text-stone-700">Opis</span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Razina igre, oprema, napomene…"
                  className="resize-y rounded-lg border border-stone-300 bg-white px-2.5 py-2 text-sm text-stone-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
                />
              </label>

              {formError ? (
                <p className="text-[0.85rem] font-medium text-rose-700" role="alert">
                  {formError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={locationsLoading || locations.length === 0}
                className="mt-1 rounded-lg bg-[#2563eb] py-2.5 text-[0.9rem] font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:bg-stone-300"
              >
                Kreiraj termin
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
