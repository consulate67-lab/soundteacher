import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  chartHasBlackKeys,
} from "../engine/noteChart";
import type { Chart, ChartCategory, ChartDifficulty } from "../engine/types";

type Props = {
  charts: Chart[];
  selectedId: string;
  disabled?: boolean;
  difficultyFilter: ChartDifficulty | "all";
  onDifficultyFilter: (d: ChartDifficulty | "all") => void;
  onSelect: (id: string) => void;
};

export function ExerciseList({
  charts,
  selectedId,
  disabled,
  difficultyFilter,
  onDifficultyFilter,
  onSelect,
}: Props) {
  const filtered =
    difficultyFilter === "all"
      ? charts
      : charts.filter((c) => c.difficulty === difficultyFilter);

  const byCategory = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="exercise-panel" aria-label="Egzersiz listesi">
      <div className="exercise-panel-head">
        <p className="exercise-panel-title">Egzersizler</p>
        <p className="exercise-panel-count">{filtered.length} parça</p>
      </div>

      <div className="diff-filters" role="tablist" aria-label="Zorluk">
        <button
          type="button"
          className={`diff-chip ${difficultyFilter === "all" ? "active" : ""}`}
          onClick={() => onDifficultyFilter("all")}
          disabled={disabled}
        >
          Tümü
        </button>
        {DIFFICULTY_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            className={`diff-chip ${difficultyFilter === d ? "active" : ""}`}
            onClick={() => onDifficultyFilter(d)}
            disabled={disabled}
          >
            {DIFFICULTY_LABELS[d]}
          </button>
        ))}
      </div>

      <div className="exercise-scroll">
        {byCategory.map(({ cat, items }) => (
          <section key={cat} className="exercise-section">
            <h2 className="exercise-section-title">
              {CATEGORY_LABELS[cat as ChartCategory]}
            </h2>
            <ul className="exercise-list">
              {items.map((c) => {
                const black = chartHasBlackKeys(c);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`exercise-item ${c.id === selectedId ? "selected" : ""}`}
                      onClick={() => onSelect(c.id)}
                      disabled={disabled}
                      aria-current={c.id === selectedId ? "true" : undefined}
                    >
                      <span className="exercise-item-title">{c.title}</span>
                      <span className="exercise-item-meta">
                        <span className={`diff-badge diff-${c.difficulty}`}>
                          {DIFFICULTY_LABELS[c.difficulty]}
                        </span>
                        {black && <span className="black-badge">Siyah tuş</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {byCategory.length === 0 && (
          <p className="exercise-empty">Bu zorlukta egzersiz yok.</p>
        )}
      </div>
    </aside>
  );
}
