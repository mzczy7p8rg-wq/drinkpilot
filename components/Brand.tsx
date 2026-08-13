type BrandProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function BrandMark({
  className = "h-14 w-14",
}: Pick<BrandProps, "className">) {
  return (
    <svg
      viewBox="0 0 72 72"
      role="img"
      aria-label="DrinkPilot, barco navegando sobre dos olas"
      className={className}
    >
      <path d="M27 8h18v7H27z" fill="#1687F8" />
      <path d="M33 3h6v6h-6z" fill="#1687F8" />
      <path d="M20 17h32l-2 17-14 8-14-8z" fill="#1687F8" />
      <path d="M25 22l11-4 11 4-1 9-10 6-10-6z" fill="#fff" opacity="0.2" />
      <circle cx="36" cy="26" r="2" fill="#fff" />
      <path
        d="M9 42c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4 5-4 10-4"
        fill="none"
        stroke="#1687F8"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M9 51c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4 5-4 10-4"
        fill="none"
        stroke="#1687F8"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <path
        d="M9 60c5 0 5 4 10 4s5-4 10-4 5 4 10 4 5-4 10-4 5 4 10 4 5-4 10-4"
        fill="none"
        stroke="#1687F8"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Brand({
  compact = false,
  inverse = false,
  className = "",
}: BrandProps) {
  return (
    <div
      className={`flex items-center ${compact ? "gap-2" : "gap-3.5"} ${className}`}
      aria-label="DrinkPilot"
    >
      <BrandMark className={compact ? "h-8 w-8" : "h-16 w-16 sm:h-20 sm:w-20"} />
      <div className="text-left">
        <p
          className={`${compact ? "text-base font-semibold" : "text-3xl font-bold sm:text-4xl"} tracking-[-0.035em] ${inverse ? "text-white" : "text-[#0B1F3A]"}`}
        >
          Drink<span className="font-medium text-[#1687F8]">Pilot</span>
        </p>
      </div>
    </div>
  );
}

export function BetaBadge() {
  return (
    <span className="rounded-xl bg-sky-500 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-white shadow-sm shadow-sky-200 sm:px-4 sm:py-2 sm:text-sm">
      BETA
    </span>
  );
}

export function BrandHeader({
  prominent = false,
  inverse = false,
}: {
  prominent?: boolean;
  inverse?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Brand compact={!prominent} inverse={inverse} />
      <BetaBadge />
    </div>
  );
}

export function WizardBrand() {
  return (
    <div className="mb-5 border-b border-white/10 pb-4 sm:mb-6 sm:pb-5">
      <BrandHeader inverse />
    </div>
  );
}
