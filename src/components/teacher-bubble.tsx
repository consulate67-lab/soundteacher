/**
 * Text-only teacher AI bubble (Dilim D).
 * Renders `…` / `[kısa durak]` / `[nefes]` with pause styling — no TTS yet.
 */

type Props = {
  text: string;
  className?: string;
};

export function TeacherBubble({ text, className = "" }: Props) {
  const parts = tokenize(text);

  return (
    <div
      className={`rounded-md border border-brand/30 bg-brand-soft/80 px-4 py-3 text-sm leading-relaxed text-foreground ${className}`}
      role="status"
      aria-label="Öğretmen"
    >
      <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-wide text-brand">
        Öğretmen
      </p>
      <p>
        {parts.map((part, i) => {
          if (part.type === "pause") {
            return (
              <span
                key={i}
                className="mx-0.5 inline-block animate-pulse text-muted"
                title={part.raw}
              >
                …
              </span>
            );
          }
          return <span key={i}>{part.value}</span>;
        })}
      </p>
    </div>
  );
}

type Token = { type: "text"; value: string } | { type: "pause"; raw: string };

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const re = /(\[nefes\]|\[kısa durak\]|\.\.\.|…)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input)) !== null) {
    if (match.index > last) {
      tokens.push({ type: "text", value: input.slice(last, match.index) });
    }
    tokens.push({ type: "pause", raw: match[0] });
    last = match.index + match[0].length;
  }
  if (last < input.length) {
    tokens.push({ type: "text", value: input.slice(last) });
  }
  return tokens;
}
