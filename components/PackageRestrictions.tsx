"use client";

import { useState } from "react";

type PackageRestrictionsProps = {
  restrictions: readonly string[];
};

export default function PackageRestrictions({
  restrictions,
}: PackageRestrictionsProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleRestrictions = expanded
    ? restrictions
    : restrictions.slice(0, 3);

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
      <p className="font-semibold text-slate-800">
        📋 Condiciones importantes
      </p>

      <ul className="mt-3 space-y-2 text-sm text-slate-600">
        {visibleRestrictions.map((restriction) => (
          <li
            key={restriction}
            className="flex items-start gap-2"
          >
            <span className="mt-0.5 text-slate-400">
              •
            </span>

            <span>{restriction}</span>
          </li>
        ))}
      </ul>

      {restrictions.length > 3 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((current) => !current);
          }}
          className="mt-4 text-sm font-semibold text-sky-700 hover:text-sky-800"
        >
          {expanded
            ? "Mostrar menos ↑"
            : `Ver todas las condiciones (${restrictions.length}) ↓`}
        </button>
      )}
    </div>
  );
}
