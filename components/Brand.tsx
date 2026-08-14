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
      className={`${className} object-contain mix-blend-lighten`}
    />
  );
}

export default function Brand({
  className = "",
}: BrandProps) {
  return (
    <div className={`flex min-w-0 flex-1 items-center ${className}`}>
      <BrandMark className="h-auto w-full" />
    </div>
  );
}

export function BetaBadge() {
  return (
    <span className="rounded-xl bg-sky-700 px-3 py-1.5 text-xs font-bold tracking-[0.12em] text-white shadow-sm shadow-sky-950/40 sm:px-4 sm:py-2 sm:text-sm">
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
    <div className="mb-5 border-b border-white/10 pb-4 sm:mb-6 sm:pb-5">
      <BrandHeader inverse />
    </div>
  );
}
