/**
 * M1.1 practice visual — looping educational posture/hands video + TR steps.
 * Media: /public/lessons/posture-hands.{mp4,webm} (original generated art).
 */

const STEPS = [
  {
    n: 1,
    title: "Sandalyede dik otur",
    body: "Ayaklar yerde, sırt dik, omuzlar düşük. Klavyeye dirsek mesafesi bırak.",
  },
  {
    n: 2,
    title: "El ve bilek",
    body: "Parmaklar yumuşak kemer; bilek tuşlarla aynı hizada; kol ağırlığı — baskı yok.",
  },
] as const;

export function PostureHandsVisual() {
  return (
    <figure
      className="st-panel overflow-hidden"
      aria-label="Oturuş ve el pozisyonu pratik videosu"
    >
      <figcaption className="border-b border-border px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-accent">
        Pratik görseli · oturuş &amp; el
      </figcaption>

      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative bg-[color-mix(in_oklab,var(--brand-ink)_8%,transparent)]">
          <video
            className="aspect-video w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/lessons/posture-hands-poster.jpg"
            aria-label="Piyanoda oturuş ve el pozisyonu animasyonu"
          >
            <source src="/lessons/posture-hands.webm" type="video/webm" />
            <source src="/lessons/posture-hands.mp4" type="video/mp4" />
          </video>
          <p className="absolute bottom-2 left-2 rounded bg-black/45 px-2 py-0.5 text-[0.65rem] text-white">
            Sessiz döngü · ~11 sn
          </p>
        </div>

        <ol className="flex flex-col justify-center gap-4 px-4 py-5">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white"
                aria-hidden
              >
                {s.n}
              </span>
              <div>
                <p className="font-[family-name:var(--font-display)] text-base font-medium text-foreground">
                  {s.title}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{s.body}</p>
              </div>
            </li>
          ))}
          <li className="text-xs leading-relaxed text-muted">
            Videoyu izlerken aynı duruşu piyanoda kur. Tempo yok — yalnızca pozisyon.
          </li>
        </ol>
      </div>
    </figure>
  );
}
