"use client";

import { useEffect } from "react";

/** Dilim H — register light SW when supported. Offline is best-effort only. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "development") {
      // Avoid sticky SW during hot reload; still installable via manifest in prod.
      return;
    }
    void navigator.serviceWorker.register("/sw.js").catch(() => {
      /* unsupported / blocked — app still works */
    });
  }, []);

  return null;
}
