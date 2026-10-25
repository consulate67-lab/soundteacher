"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readPathLocal, savePathLocal } from "@/lib/path-client";

/**
 * If JWT cookie was dropped but localStorage still has a completed Path,
 * restore the cookie via API and hard-nav to /trial-program.
 */
export function PlacementRescue() {
  const pathname = usePathname();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    if (!pathname?.startsWith("/placement")) return;

    const local = readPathLocal();
    if (!local?.placementComplete) return;
    ran.current = true;

    void (async () => {
      try {
        const status = await fetch("/api/placement", { credentials: "same-origin" });
        if (status.ok) {
          const data = (await status.json()) as { placementComplete?: boolean };
          if (data.placementComplete) {
            window.location.assign("/trial-program");
            return;
          }
        }
        const res = await fetch("/api/placement", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "restore", path: local }),
        });
        if (res.ok) {
          const data = (await res.json()) as { path?: typeof local };
          if (data.path) savePathLocal(data.path);
          window.location.assign("/trial-program");
          return;
        }
      } catch {
        /* ignore */
      }
      router.replace("/trial-program");
    })();
  }, [pathname, router]);

  return null;
}
