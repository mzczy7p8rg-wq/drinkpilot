type ProgressBarProps = {
  currentStep: number;
  totalSteps: number;
};

export default function ProgressBar({
  currentStep,
  totalSteps,
}: ProgressBarProps) {
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8 rounded-2xl border border-sky-950/8 bg-white/70 p-3.5 shadow-[0_10px_28px_rgba(31,93,137,0.06)] backdrop-blur sm:p-4">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold tracking-wide text-slate-500">
        <span>Paso {currentStep} de {totalSteps}</span>
        <span className="rounded-full bg-sky-50 px-2.5 py-1 text-sky-700">
          {Math.round(percentage)}%
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sky-600 via-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(14,165,233,0.35)] transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
