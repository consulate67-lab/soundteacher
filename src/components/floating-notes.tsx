/** Decorative animated musical notes — CSS only, non-interactive. */
export function FloatingNotes() {
  const notes = [
    { ch: "♪", left: "8%", delay: "0s", dur: "18s", size: "1.4rem" },
    { ch: "♫", left: "18%", delay: "3s", dur: "22s", size: "1.1rem" },
    { ch: "♩", left: "28%", delay: "7s", dur: "16s", size: "1.6rem" },
    { ch: "♬", left: "42%", delay: "1.5s", dur: "20s", size: "1.25rem" },
    { ch: "♪", left: "55%", delay: "5s", dur: "19s", size: "1.5rem" },
    { ch: "♫", left: "68%", delay: "9s", dur: "17s", size: "1.15rem" },
    { ch: "♩", left: "78%", delay: "2s", dur: "21s", size: "1.35rem" },
    { ch: "♪", left: "88%", delay: "6s", dur: "15s", size: "1.2rem" },
    { ch: "♬", left: "12%", delay: "11s", dur: "23s", size: "1rem" },
    { ch: "♫", left: "72%", delay: "13s", dur: "18s", size: "1.45rem" },
  ] as const;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {notes.map((n, i) => (
        <span
          key={i}
          className="st-float-note absolute bottom-[-2rem] text-brand/25"
          style={{
            left: n.left,
            fontSize: n.size,
            animationDelay: n.delay,
            animationDuration: n.dur,
          }}
        >
          {n.ch}
        </span>
      ))}
    </div>
  );
}
