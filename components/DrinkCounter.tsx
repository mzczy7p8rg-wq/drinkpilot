"use client";

import { MAX_DAILY_DRINKS_PER_CATEGORY } from "@/lib/wizardNumberValidation";

type DrinkCounterProps = {
  label: string;
  accessibleLabel: string;
  value: number;
  onChange: (value: number) => void;
  max?: number;
};

export default function DrinkCounter({
  label,
  accessibleLabel,
  value,
  onChange,
  max = MAX_DAILY_DRINKS_PER_CATEGORY,
}: DrinkCounterProps) {
  const canIncrement =
    Number.isSafeInteger(value) &&
    value < max;

  return (
    <div
      role="group"
      aria-label={accessibleLabel}
      className="flex items-center justify-between gap-4 rounded-2xl border border-sky-950/10 bg-white/90 p-3.5 shadow-[0_10px_28px_rgba(31,93,137,0.07)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 sm:p-4"
    >

      <span className="min-w-0 text-base font-medium text-slate-800 sm:text-lg">
        {label}
      </span>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">

        <button
          type="button"
          aria-label={`Reducir ${accessibleLabel}`}
          onClick={() =>
            onChange(Math.max(0, value - 1))
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-sky-950/8 bg-slate-100 text-xl font-bold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 active:scale-95 sm:h-10 sm:w-10"
        >
          −
        </button>

        <output
          aria-label={`Cantidad de ${accessibleLabel}`}
          className="w-9 text-center text-xl font-extrabold tabular-nums text-slate-900"
        >
          {value}
        </output>

        <button
          type="button"
          aria-label={`Aumentar ${accessibleLabel}`}
          disabled={!canIncrement}
          onClick={() =>
            canIncrement &&
            onChange(value + 1)
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 text-xl font-bold text-white shadow-[0_8px_18px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:from-sky-500 hover:to-blue-600 active:translate-y-0 active:scale-95 disabled:cursor-not-allowed disabled:bg-none disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none sm:h-10 sm:w-10"
        >
          +
        </button>

      </div>

    </div>
  );
}
