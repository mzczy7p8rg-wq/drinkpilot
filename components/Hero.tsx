"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function Hero() {
  const { resetData } = useStore();

  return (
    <section className="max-w-3xl text-center">

      <div className="text-6xl mb-6">🚢</div>

      <h1 className="text-5xl font-bold text-slate-900">
        DrinkPilot
      </h1>

      <p className="mt-6 text-xl text-slate-600">
        Descubre si el paquete de bebidas realmente merece la pena.
      </p>

      <p className="mt-2 text-slate-500">
        Análisis personalizado en menos de un minuto.
      </p>

      <Link
        href="/wizard"
        onNavigate={resetData}
        className="inline-block mt-10 rounded-xl bg-sky-600 px-8 py-4 text-white font-semibold hover:bg-sky-700 transition"
      >
        Empezar análisis
      </Link>

    </section>
  );
}
