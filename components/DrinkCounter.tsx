"use client";

type DrinkCounterProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
};

export default function DrinkCounter({
  label,
  value,
  onChange,
}: DrinkCounterProps) {
  const canIncrement =
    Number.isSafeInteger(value) &&
    value < Number.MAX_SAFE_INTEGER;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">

      <span className="min-w-0 text-base font-medium text-slate-800 sm:text-lg">
        {label}
      </span>

      <div className="flex shrink-0 items-center gap-3 sm:gap-4">

        <button
          type="button"
          aria-label={`Reducir ${label}`}
          onClick={() =>
            onChange(Math.max(0, value - 1))
          }
          className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-900 transition hover:bg-slate-300 active:bg-slate-400 sm:h-10 sm:w-10"
        >
          −
        </button>

        <span className="w-8 text-center text-xl font-bold text-slate-900">
          {value}
        </span>

        <button
          type="button"
          aria-label={`Aumentar ${label}`}
          disabled={!canIncrement}
          onClick={() =>
            canIncrement &&
            onChange(value + 1)
          }
          className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-600 text-xl font-bold text-white transition hover:bg-sky-700 active:bg-sky-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 sm:h-10 sm:w-10"
        >
          +
        </button>

      </div>

    </div>
  );
}
