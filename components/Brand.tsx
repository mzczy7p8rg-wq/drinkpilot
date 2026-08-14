import Image from "next/image";

type BrandProps = {
  compact?: boolean;
  inverse?: boolean;
  className?: string;
};

export function BrandMark({
  className = "h-auto w-48",
}: Pick<BrandProps, "className">) {
  return (
    <Image
      src="/drinkpilot-logo-horizontal.png"
      alt="DrinkPilot · Tu guía para disfrutar más"
      width={1200}
      height={400}
      priority
      className={`${className} rounded-xl object-contain`}
    />
  );
}

export default function Brand({
  compact = false,
  className = "",
}: BrandProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <BrandMark
        className={
          compact
            ? "h-auto w-44 sm:w-56"
            : "h-auto w-60 sm:w-80"
        }
      />
    </div>
  );
}

export function BetaBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[0.68rem] font-bold tracking-[0.14em] text-sky-700 shadow-sm sm:px-4 sm:py-2 sm:text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
      BETA
    </span>
  );
}

export function BrandHeader({
  prominent = false,
}: {
  prominent?: boolean;
  inverse?: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <Brand compact={!prominent} />
      <BetaBadge />
    </div>
  );
}

export function WizardBrand() {
  return (
    <div className="mb-5 border-b border-sky-950/8 pb-4 sm:mb-6 sm:pb-5">
      <BrandHeader inverse />
    </div>
  );
}
