import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  DIFFICULTY_LABELS,
  DIFFICULTY_ORDER,
  LOCALE_LABELS,
  LOCALE_ORDER,
  chartHasBlackKeys,
} from "../engine/noteChart";
import type { Chart, ChartCategory, ChartDifficulty, ChartLocale } from "../engine/types";

type Props = {
  charts: Chart[];
  selectedId: string;
  disabled?: boolean;
  difficultyFilter: ChartDifficulty | "all";
  onDifficultyFilter: (d: ChartDifficulty | "all") => void;
  localeFilter: ChartLocale | "all";
  onLocaleFilter: (l: ChartLocale | "all") => void;
  onSelect: (id: string) => void;
};

export function ExerciseList({
  charts,
  selectedId,
  disabled,
  difficultyFilter,
  onDifficultyFilter,
  localeFilter,
  onLocaleFilter,
  onSelect,
}: Props) {
  const filtered = charts.filter((c) => {
    if (difficultyFilter !== "all" && c.difficulty !== difficultyFilter) {
      return false;
    }
    if (localeFilter !== "all" && c.locale !== localeFilter) {
      return false;
    }
    return true;
  });

  const byLocale = LOCALE_ORDER.map((locale) => {
    const localeCharts = filtered.filter((c) => c.locale === locale);
    const categories = CATEGORY_ORDER.map((cat) => ({
      cat,
      items: localeCharts.filter((c) => c.category === cat),
    })).filter((g) => g.items.length > 0);
    return { locale, categories, count: localeCharts.length };
  }).filter((g) => g.count > 0);

  return (
    <aside className="exercise-panel" aria-label="Egzersiz listesi">
      <div className="exercise-panel-head">
        <p className="exercise-panel-title">Egzersizler</p>
        <p className="exercise-panel-count">{filtered.length} parça</p>
      </div>

      <div className="locale-filters" role="tablist" aria-label="Dil grubu">
        <button
          type="button"
          className={`locale-chip ${localeFilter === "all" ? "active" : ""}`}
          onClick={() => onLocaleFilter("all")}
          disabled={disabled}
        >
          Tümü
        </button>
        {LOCALE_ORDER.map((l) => (
          <button
            key={l}
            type="button"
            className={`locale-chip ${localeFilter === l ? "active" : ""}`}
            onClick={() => onLocaleFilter(l)}
            disabled={disabled}
          >
            {LOCALE_LABELS[l]}
          </button>
        ))}
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
        {byLocale.map(({ locale, categories }) => (
          <section key={locale} className="exercise-locale">
            <h2 className="exercise-locale-title">{LOCALE_LABELS[locale]}</h2>
            {categories.map(({ cat, items }) => (
              <div key={cat} className="exercise-section">
                <h3 className="exercise-section-title">
                  {CATEGORY_LABELS[cat as ChartCategory]}
                </h3>
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
              </div>
            ))}
          </section>
        ))}
        {byLocale.length === 0 && (
          <p className="exercise-empty">Bu süzgeçte egzersiz yok.</p>
        )}
      </div>
    </aside>
  );
}
