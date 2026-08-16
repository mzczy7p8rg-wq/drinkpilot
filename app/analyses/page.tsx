"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { WizardBrand } from "@/components/Brand";
import { getCruiseLine } from "@/data/cruiseLines";
import {
  formatAnalysisSailingDate,
  resolveAnalysisDestination,
  sortSavedAnalyses,
  type SavedAnalysisSort,
} from "@/lib/savedAnalyses";
import { useStore } from "@/lib/store";

export default function AnalysesPage() {
  const router = useRouter();
  const [pendingDeletion, setPendingDeletion] = useState<string | null>(null);
  const [editingAnalysisId, setEditingAnalysisId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [sort, setSort] = useState<SavedAnalysisSort>("recent");
  const {
    hydrated,
    savedAnalyses,
    loadAnalysis,
    duplicateAnalysis,
    renameAnalysis,
    deleteAnalysis,
  } = useStore();

  const sortedAnalyses = sortSavedAnalyses(savedAnalyses, sort);

  function openAnalysis(id: string) {
    const analysis = savedAnalyses.find((item) => item.id === id);

    if (analysis && loadAnalysis(id)) {
      router.push(resolveAnalysisDestination(analysis.data));
    }
  }

  function duplicate(id: string) {
    const duplicateId = duplicateAnalysis(id);

    if (duplicateId) {
      setPendingDeletion(null);
    }
  }

  function startRenaming(id: string, currentName: string | null | undefined) {
    setEditingAnalysisId(id);
    setDraftName(currentName ?? "");
    setPendingDeletion(null);
  }

  function saveName(id: string) {
    if (renameAnalysis(id, draftName)) {
      setEditingAnalysisId(null);
      setDraftName("");
    }
  }

  return (
    <main className="brand-ocean-bg min-h-screen px-3 py-3 sm:px-6 sm:py-8">
      <section className="dark-app-surface mx-auto w-full max-w-5xl rounded-[1.75rem] p-5 sm:rounded-[2rem] sm:p-8">
        <WizardBrand />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
              Tus comparaciones
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              Mis análisis
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Guarda varios cruceros en este dispositivo y vuelve a ellos cuando quieras.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-sky-300/40 bg-white/10 px-5 py-3 font-semibold text-sky-100 transition hover:bg-white/15"
          >
            Volver al inicio
          </Link>
        </div>

        {!hydrated ? (
          <p className="mt-8 text-slate-300">Cargando tus análisis…</p>
        ) : savedAnalyses.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-sky-200/20 bg-white/5 p-6 text-center sm:p-10">
            <p className="text-xl font-bold text-white">Aún no tienes análisis guardados</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Se guardarán automáticamente cuando confirmes quién viaja.
            </p>
            <Link
              href="/wizard/people"
              className="mt-6 inline-flex rounded-xl bg-sky-700 px-6 py-3 font-semibold text-white transition hover:bg-sky-800"
            >
              Empezar análisis
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            <div className="flex flex-col gap-2 rounded-2xl border border-sky-200/20 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <label
                htmlFor="analyses-sort"
                className="text-sm font-semibold text-slate-200"
              >
                Ordenar por
              </label>

              <select
                id="analyses-sort"
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as SavedAnalysisSort)
                }
                className="min-h-11 rounded-xl border border-sky-300/30 bg-slate-900 px-4 py-2 text-sm font-semibold text-white outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-300/30 sm:min-w-48"
              >
                <option value="recent">Más reciente</option>
                <option value="name">Nombre</option>
                <option value="cruise-line">Naviera</option>
              </select>
            </div>

            {sortedAnalyses.map((analysis) => {
              const cruiseLine = getCruiseLine(analysis.data.cruiseLine);
              const isComplete = resolveAnalysisDestination(analysis.data) === "/results";

              return (
                <article
                  key={analysis.id}
                  className="rounded-2xl border border-sky-200/20 bg-white/7 p-5 sm:p-6"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-bold text-white">
                          {analysis.name || analysis.data.shipName || cruiseLine.name}
                        </h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${isComplete ? "bg-emerald-400/15 text-emerald-200" : "bg-amber-300/15 text-amber-100"}`}>
                          {isComplete ? "Resultado disponible" : "En curso"}
                        </span>
                      </div>

                      {analysis.name || analysis.data.shipName ? (
                        <p className="mt-1 text-sm font-semibold text-sky-200">
                          {analysis.name && analysis.data.shipName
                            ? `${analysis.data.shipName} · `
                            : ""}
                          {cruiseLine.name}
                        </p>
                      ) : null}

                      {editingAnalysisId === analysis.id ? (
                        <form
                          className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                          onSubmit={(event) => {
                            event.preventDefault();
                            saveName(analysis.id);
                          }}
                        >
                          <label className="sr-only" htmlFor={`analysis-name-${analysis.id}`}>
                            Nombre personalizado
                          </label>
                          <input
                            id={`analysis-name-${analysis.id}`}
                            type="text"
                            maxLength={60}
                            value={draftName}
                            onChange={(event) => setDraftName(event.target.value)}
                            placeholder="Ej. Crucero familiar septiembre"
                            autoFocus
                            className="min-h-11 rounded-xl border border-sky-300/40 bg-white/10 px-3 py-2 text-white outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-300/30"
                          />
                          <button
                            type="submit"
                            className="rounded-xl bg-sky-700 px-4 py-2 font-semibold text-white transition hover:bg-sky-800"
                          >
                            Guardar nombre
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingAnalysisId(null);
                              setDraftName("");
                            }}
                            className="rounded-xl border border-white/15 px-4 py-2 font-semibold text-slate-300 transition hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                        </form>
                      ) : null}

                      <p className="mt-2 text-sm text-slate-300">
                        {analysis.data.cruiseNights !== null
                          ? `${analysis.data.cruiseNights} ${analysis.data.cruiseNights === 1 ? "noche" : "noches"}`
                          : "Duración pendiente"}
                        {analysis.data.sailingDate ? ` · Salida ${formatAnalysisSailingDate(analysis.data.sailingDate)}` : ""}
                        {` · ${analysis.data.adults} adulto${analysis.data.adults === 1 ? "" : "s"}`}
                        {analysis.data.minors > 0 ? ` · ${analysis.data.minors} menor${analysis.data.minors === 1 ? "" : "es"}` : ""}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Actualizado {new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(analysis.updatedAt))}
                      </p>
                    </div>

                    {editingAnalysisId !== analysis.id ? (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        <button
                          type="button"
                          onClick={() => openAnalysis(analysis.id)}
                          className="rounded-xl bg-sky-700 px-4 py-3 font-semibold text-white transition hover:bg-sky-800"
                        >
                          {isComplete ? "Abrir resultado" : "Continuar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicate(analysis.id)}
                          className="rounded-xl border border-sky-300/40 bg-white/10 px-4 py-3 font-semibold text-sky-100 transition hover:bg-white/15"
                        >
                          Duplicar
                        </button>

                        <button
                          type="button"
                          onClick={() => startRenaming(analysis.id, analysis.name)}
                          className="rounded-xl border border-sky-300/40 bg-white/10 px-4 py-3 font-semibold text-sky-100 transition hover:bg-white/15"
                        >
                          Editar nombre
                        </button>

                        {pendingDeletion === analysis.id ? (
                          <button
                            type="button"
                            onClick={() => deleteAnalysis(analysis.id)}
                            className="rounded-xl border border-red-300/50 bg-red-400/15 px-4 py-3 font-semibold text-red-100"
                          >
                            Confirmar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeletion(analysis.id)}
                            className="rounded-xl border border-white/15 px-4 py-3 font-semibold text-slate-300 transition hover:bg-white/10"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
