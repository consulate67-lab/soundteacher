"use client";

import { useEffect, useRef, useState } from "react";
import { readPathLocal, savePathLocal } from "@/lib/path-client";

/**
 * Client-first gate for /trial-program.
 * Server must NOT redirect to /placement when Path cookie is missing —
 * otherwise PlacementRescue never gets a chance and the user loops.
 */
export function TrialProgramBootstrap() {
  const ran = useRef(false);
  const [message, setMessage] = useState("Deneme programı hazırlanıyor…");

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      try {
        const status = await fetch("/api/placement", {
          credentials: "same-origin",
        });
        if (status.ok) {
          const data = (await status.json()) as {
            placementComplete?: boolean;
          };
          if (data.placementComplete) {
            window.location.reload();
            return;
          }
        }

        const local = readPathLocal();
        if (local?.placementComplete) {
          setMessage("Yerleştirme kaydı geri yükleniyor…");
          const res = await fetch("/api/placement", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "restore", path: local }),
          });
          if (res.ok) {
            const data = (await res.json()) as { path?: typeof local };
            if (data.path) savePathLocal(data.path);
            window.location.reload();
            return;
          }
        }

        setMessage("Yerleştirme henüz tamamlanmadı — yönlendiriliyor…");
        window.location.replace("/placement");
      } catch {
        setMessage("Bağlantı hatası — yerleştirme sayfasına dönülüyor…");
        window.location.replace("/placement");
      }
    })();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-brand">
        SoundTeacher
      </p>
      <p className="mt-4 text-sm text-muted" role="status">
        {message}
      </p>
    </main>
  );
}
