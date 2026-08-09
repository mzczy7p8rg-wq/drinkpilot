export const marketOptions = [
  {
    value: "ES",
    label: "España",
  },
  {
    value: "EU",
    label: "Europa / internacional",
  },
  {
    value: "US",
    label: "Estados Unidos",
  },
] as const;

export const sailingRegionOptions = [
  {
    value: "MED",
    label: "Mediterráneo",
  },
  {
    value: "NOR",
    label: "Norte de Europa",
  },
  {
    value: "WEE",
    label: "Europa occidental",
  },
  {
    value: "NORTH AMERICA",
    label: "Norteamérica",
  },
  {
    value: "CARIBBEAN",
    label: "Caribe",
  },
  {
    value: "SOUTH AMERICA",
    label: "Sudamérica",
  },
] as const;

function resolveOptionLabel(
  value: string | null,
  options: readonly {
    value: string;
    label: string;
  }[]
): string {
  if (value === null) {
    return "No indicado";
  }

  return (
    options.find(
      (option) =>
        option.value === value.trim().toUpperCase()
    )?.label ?? value
  );
}

export function getMarketLabel(
  market: string | null
): string {
  return resolveOptionLabel(market, marketOptions);
}

export function getSailingRegionLabel(
  sailingRegion: string | null
): string {
  return resolveOptionLabel(
    sailingRegion,
    sailingRegionOptions
  );
}
