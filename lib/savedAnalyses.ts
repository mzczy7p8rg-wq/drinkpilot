import type { WizardData } from "@/lib/store";
import { getCruiseLine, isCruiseLineKey } from "@/data/cruiseLines";
import {
  hasValidConsumptionStep,
  hasValidCruiseStep,
  hasValidPeopleStep,
} from "@/lib/wizardProgress";

export const SAVED_ANALYSES_KEY = "drinkpilot-saved-analyses";
export const ACTIVE_ANALYSIS_KEY = "drinkpilot-active-analysis";
const SAVED_ANALYSES_VERSION = 1;

export type SavedAnalysis = {
  id: string;
  name?: string | null;
  createdAt: string;
  updatedAt: string;
  data: WizardData;
};

export type SavedAnalysisSort =
  | "recent"
  | "name"
  | "cruise-line";

const analysisSortCollator = new Intl.Collator("es-ES", {
  sensitivity: "base",
  numeric: true,
});

export function resolveAnalysisDisplayName(
  analysis: SavedAnalysis
): string {
  return (
    analysis.name ||
    analysis.data.shipName ||
    getCruiseLine(analysis.data.cruiseLine).name
  );
}

function compareAnalysesByRecent(
  left: SavedAnalysis,
  right: SavedAnalysis
): number {
  const updatedComparison =
    right.updatedAt.localeCompare(left.updatedAt);

  if (updatedComparison !== 0) {
    return updatedComparison;
  }

  return left.id.localeCompare(right.id);
}

export function sortSavedAnalyses(
  analyses: SavedAnalysis[],
  sort: SavedAnalysisSort
): SavedAnalysis[] {
  return [...analyses].sort((left, right) => {
    if (sort === "name") {
      const nameComparison = analysisSortCollator.compare(
        resolveAnalysisDisplayName(left),
        resolveAnalysisDisplayName(right)
      );

      return nameComparison !== 0
        ? nameComparison
        : compareAnalysesByRecent(left, right);
    }

    if (sort === "cruise-line") {
      const cruiseLineComparison = analysisSortCollator.compare(
        getCruiseLine(left.data.cruiseLine).name,
        getCruiseLine(right.data.cruiseLine).name
      );

      return cruiseLineComparison !== 0
        ? cruiseLineComparison
        : compareAnalysesByRecent(left, right);
    }

    return compareAnalysesByRecent(left, right);
  });
}

function isStoredAnalysis(value: unknown): value is SavedAnalysis {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<SavedAnalysis>;
  const candidateData = candidate.data as Partial<WizardData> | undefined;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.createdAt === "string" &&
    Number.isFinite(Date.parse(candidate.createdAt)) &&
    typeof candidate.updatedAt === "string" &&
    Number.isFinite(Date.parse(candidate.updatedAt)) &&
    (candidate.name === undefined ||
      candidate.name === null ||
      typeof candidate.name === "string") &&
    Boolean(candidateData) &&
    typeof candidateData === "object" &&
    !Array.isArray(candidateData) &&
    isCruiseLineKey(candidateData?.cruiseLine) &&
    typeof candidateData?.days === "number" &&
    typeof candidateData?.people === "number" &&
    (candidateData?.shipName === undefined ||
      candidateData.shipName === null ||
      typeof candidateData.shipName === "string")
  );
}

export function resolveStoredAnalyses(value: unknown): SavedAnalysis[] {
  const items =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { version?: unknown }).version === SAVED_ANALYSES_VERSION &&
    Array.isArray((value as { analyses?: unknown }).analyses)
      ? (value as { analyses: unknown[] }).analyses
      : Array.isArray(value)
        ? value
        : null;

  if (!items) {
    return [];
  }

  const unique = new Map<string, SavedAnalysis>();

  for (const item of items) {
    if (isStoredAnalysis(item)) {
      unique.set(item.id, {
        ...item,
        name:
          typeof item.name === "string"
            ? normalizeAnalysisName(item.name)
            : null,
      });
    }
  }

  return [...unique.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt)
  );
}

export function serializeSavedAnalyses(analyses: SavedAnalysis[]): string {
  return JSON.stringify({
    version: SAVED_ANALYSES_VERSION,
    analyses,
  });
}

export function parseStoredAnalyses(rawValue: string | null): SavedAnalysis[] {
  if (!rawValue) {
    return [];
  }

  try {
    return resolveStoredAnalyses(JSON.parse(rawValue));
  } catch {
    return [];
  }
}

export function createAnalysisId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `analysis-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createSavedAnalysis(
  data: WizardData,
  options?: {
    id?: string;
    name?: string | null;
    now?: string;
  }
): SavedAnalysis {
  const now = options?.now ?? new Date().toISOString();

  return {
    id: options?.id ?? createAnalysisId(),
    name:
      typeof options?.name === "string"
        ? normalizeAnalysisName(options.name)
        : null,
    createdAt: now,
    updatedAt: now,
    data: structuredClone(data),
  };
}

export function upsertSavedAnalysis(
  analyses: SavedAnalysis[],
  id: string,
  data: WizardData,
  now = new Date().toISOString()
): SavedAnalysis[] {
  const existing = analyses.find((analysis) => analysis.id === id);
  const next: SavedAnalysis = {
    id,
    name: existing?.name ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    data: structuredClone(data),
  };

  return [next, ...analyses.filter((analysis) => analysis.id !== id)];
}

export function duplicateSavedAnalysis(
  analyses: SavedAnalysis[],
  id: string,
  options?: {
    duplicateId?: string;
    now?: string;
  }
): SavedAnalysis[] {
  const source = analyses.find((analysis) => analysis.id === id);

  if (!source) {
    return analyses;
  }

  return [
    createSavedAnalysis(source.data, {
      id: options?.duplicateId,
      name: source.name ? `${source.name} (copia)` : null,
      now: options?.now,
    }),
    ...analyses,
  ];
}

export function normalizeAnalysisName(name: string): string | null {
  const normalized = name.trim().replace(/\s+/g, " ").slice(0, 60);

  return normalized === "" ? null : normalized;
}

export function renameSavedAnalysis(
  analyses: SavedAnalysis[],
  id: string,
  name: string,
  now = new Date().toISOString()
): SavedAnalysis[] {
  const nextName = normalizeAnalysisName(name);
  const existing = analyses.find((analysis) => analysis.id === id);

  if (!existing) {
    return analyses;
  }

  return [
    {
      ...existing,
      name: nextName,
      updatedAt: now,
    },
    ...analyses.filter((analysis) => analysis.id !== id),
  ];
}

export function resolveAnalysisDestination(data: WizardData): string {
  if (!hasValidPeopleStep(data)) {
    return "/wizard/people";
  }

  if (!hasValidCruiseStep(data)) {
    return "/wizard";
  }

  if (!hasValidConsumptionStep(data)) {
    return "/wizard/consumption";
  }

  return "/results";
}

export function formatAnalysisSailingDate(sailingDate: string): string {
  const date = new Date(`${sailingDate}T00:00:00Z`);

  if (!Number.isFinite(date.getTime())) {
    return sailingDate;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .replaceAll(".", "");
}
