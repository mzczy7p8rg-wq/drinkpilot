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
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <span className="text-lg font-medium text-slate-800">
        {label}
      </span>

      <div className="flex items-center gap-4">

        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-xl font-bold transition hover:bg-slate-300"
        >
          −
        </button>

        <span className="w-8 text-center text-xl font-bold">
          {value}
        </span>

        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-xl font-bold text-white transition hover:bg-sky-700"
        >
          +
        </button>

      </div>

    </div>
  );
}