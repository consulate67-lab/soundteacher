/**
 * Lightweight CSS/SVG practice diagram — sit posture + hand position.
 * No Lottie / image assets.
 */

export function PostureHandsVisual() {
  return (
    <figure
      className="st-panel overflow-hidden px-4 py-5"
      aria-label="Oturuş ve el pozisyonu animasyonu"
    >
      <figcaption className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-accent">
        Pratik görseli · oturuş &amp; el
      </figcaption>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center gap-2">
          <svg
            viewBox="0 0 160 180"
            className="h-40 w-auto text-brand"
            role="img"
            aria-label="Sandalyede oturuş"
          >
            <rect
              x="40"
              y="110"
              width="80"
              height="10"
              rx="2"
              fill="currentColor"
              opacity="0.25"
            />
            <rect
              x="48"
              y="120"
              width="8"
              height="40"
              fill="currentColor"
              opacity="0.2"
            />
            <rect
              x="104"
              y="120"
              width="8"
              height="40"
              fill="currentColor"
              opacity="0.2"
            />
            <g className="st-posture-breathe">
              <circle cx="80" cy="42" r="14" fill="currentColor" opacity="0.85" />
              <path
                d="M80 56 L80 95 M80 70 L55 88 M80 70 L105 88 M80 95 L62 130 M80 95 L98 130"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                opacity="0.9"
              />
            </g>
            <rect
              x="30"
              y="98"
              width="100"
              height="8"
              rx="1"
              fill="currentColor"
              opacity="0.35"
            />
            <line
              x1="50"
              y1="160"
              x2="110"
              y2="160"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.3"
              strokeLinecap="round"
            />
          </svg>
          <p className="text-center text-xs font-medium text-foreground">
            1 · Sandalyede rahat otur
          </p>
          <p className="text-center text-[0.7rem] leading-snug text-muted">
            Ayaklar yerde · omuzlar düşük · mesafe dirsek rahat
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <svg
            viewBox="0 0 160 180"
            className="h-40 w-auto text-brand"
            role="img"
            aria-label="El pozisyonu"
          >
            <g opacity="0.35">
              {Array.from({ length: 7 }).map((_, i) => (
                <rect
                  key={i}
                  x={28 + i * 16}
                  y="100"
                  width="14"
                  height="48"
                  rx="1"
                  fill="currentColor"
                />
              ))}
              {[36, 52, 84, 100].map((x) => (
                <rect
                  key={x}
                  x={x}
                  y="100"
                  width="10"
                  height="28"
                  rx="1"
                  fill="currentColor"
                  opacity="0.9"
                />
              ))}
            </g>
            <g className="st-hand-settle">
              <ellipse
                cx="80"
                cy="78"
                rx="28"
                ry="16"
                fill="currentColor"
                opacity="0.55"
              />
              {[58, 70, 82, 94, 104].map((x, i) => (
                <rect
                  key={x}
                  x={x - 4}
                  y={88}
                  width="8"
                  height={22 + (i === 0 || i === 4 ? -4 : 2)}
                  rx="3"
                  fill="currentColor"
                  opacity="0.75"
                />
              ))}
              <path
                d="M52 72 Q40 60 34 48"
                stroke="currentColor"
                strokeWidth="7"
                strokeLinecap="round"
                fill="none"
                opacity="0.5"
              />
            </g>
            <rect
              className="st-key-glow"
              x="60"
              y="100"
              width="40"
              height="8"
              rx="1"
              fill="var(--accent)"
            />
          </svg>
          <p className="text-center text-xs font-medium text-foreground">
            2 · Eller tuşların üstünde
          </p>
          <p className="text-center text-[0.7rem] leading-snug text-muted">
            Bilek nötr · parmaklar yumuşak kemer · baskı yok
          </p>
        </div>
      </div>

      <style>{`
        .st-posture-breathe {
          transform-origin: 80px 95px;
          animation: st-posture-breathe 3.2s ease-in-out infinite;
        }
        .st-hand-settle {
          transform-origin: 80px 100px;
          animation: st-hand-settle 2.8s ease-in-out infinite;
        }
        .st-key-glow {
          animation: st-key-glow 2.8s ease-in-out infinite;
        }
        @keyframes st-posture-breathe {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes st-hand-settle {
          0%, 100% { transform: translateY(0); }
          45% { transform: translateY(4px); }
        }
        @keyframes st-key-glow {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.45; }
        }
        @media (prefers-reduced-motion: reduce) {
          .st-posture-breathe,
          .st-hand-settle,
          .st-key-glow {
            animation: none !important;
          }
        }
      `}</style>
    </figure>
  );
}
