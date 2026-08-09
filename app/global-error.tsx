"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
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
    <html lang="es">
      <body
        style={{
          margin: 0,
          background: "#f8fafc",
          color: "#0f172a",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "520px",
              padding: "40px",
              borderRadius: "16px",
              background: "white",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
              textAlign: "center",
            }}
          >
            <title>Error | DrinkPilot</title>
            <p style={{ color: "#0369a1", fontWeight: 700 }}>
              DrinkPilot
            </p>
            <h1>Ha ocurrido un error inesperado</h1>
            <p style={{ color: "#475569", lineHeight: 1.6 }}>
              Inténtalo de nuevo. Si el problema continúa, vuelve al inicio y comienza un análisis nuevo.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                marginTop: "16px",
                border: 0,
                borderRadius: "12px",
                background: "#0284c7",
                color: "white",
                padding: "12px 20px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Volver a intentarlo
            </button>
            <p style={{ marginTop: "20px" }}>
              <Link href="/" style={{ color: "#0369a1", fontWeight: 700 }}>
                Ir al inicio
              </Link>
            </p>
            {error.digest ? (
              <p style={{ marginTop: "24px", color: "#94a3b8", fontSize: "12px" }}>
                Referencia: {error.digest}
              </p>
            ) : null}
          </div>
        </main>
      </body>
    </html>
  );
}
