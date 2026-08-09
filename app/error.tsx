"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          DrinkPilot
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          No hemos podido completar esta pantalla
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          Puede tratarse de un problema temporal. Vuelve a intentarlo o regresa al inicio para continuar.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-xl bg-sky-600 px-4 py-3 font-semibold text-white transition hover:bg-sky-700"
          >
            Volver a intentarlo
          </button>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Ir al inicio
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 text-xs text-slate-400">
            Referencia: {error.digest}
          </p>
        ) : null}
      </div>
    </main>
  );
}
