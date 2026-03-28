import type { ReactNode } from 'react';

export interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex gap-3 py-2.5">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        {label ? <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</p> : null}
        <div className={`text-sm font-medium text-stone-900 ${label ? 'mt-0.5' : ''}`}>{value}</div>
      </div>
    </div>
  );
}
