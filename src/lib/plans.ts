export type PlanId =
  | "trial"
  | "monthly"
  | "quarterly"
  | "semiannual"
  | "yearly";

export type PlanOption = {
  id: PlanId;
  name: string;
  period: string;
  /** Months in the billing period. */
  months: number;
  /** Lessons included in the period (8 / ay cadence). */
  lessonCount: number;
  /** Price in TRY (integer lira). */
  priceTry: number;
  priceLabel: string;
  blurb: string;
  badge?: string;
};

export const LESSONS_PER_MONTH = 8;

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR").format(amount) + " TL";
}

function perLessonHint(priceTry: number, lessonCount: number): string {
  const per = Math.round(priceTry / lessonCount);
  return `≈ ${formatTry(per)} / ders`;
}

/** Paid subscription tiers — 8 ders / ay cadence. */
export const PAID_PLANS: PlanOption[] = [
  {
    id: "monthly",
    name: "1 aylık",
    period: "1 ay",
    months: 1,
    lessonCount: 8,
    priceTry: 6000,
    priceLabel: formatTry(6000),
    blurb: `8 ders · ${perLessonHint(6000, 8)}`,
  },
  {
    id: "quarterly",
    name: "3 aylık",
    period: "3 ay",
    months: 3,
    lessonCount: 24,
    priceTry: 15000,
    priceLabel: formatTry(15000),
    blurb: `24 ders · ${perLessonHint(15000, 24)}`,
    badge: "Popüler",
  },
  {
    id: "semiannual",
    name: "6 aylık",
    period: "6 ay",
    months: 6,
    lessonCount: 48,
    priceTry: 20000,
    priceLabel: formatTry(20000),
    blurb: `48 ders · ${perLessonHint(20000, 48)}`,
  },
  {
    id: "yearly",
    name: "1 yıllık",
    period: "1 yıl",
    months: 12,
    lessonCount: 96,
    priceTry: 45000,
    priceLabel: formatTry(45000),
    blurb: `96 ders · ${perLessonHint(45000, 96)}`,
    badge: "En avantajlı",
  },
];

/** Free deneme shown alongside paid plans where needed. */
export const TRIAL_PLAN: PlanOption = {
  id: "trial",
  name: "Ücretsiz deneme",
  period: "yerleştirme + deneme paketi",
  months: 0,
  lessonCount: 0,
  priceTry: 0,
  priceLabel: "Ücretsiz",
  blurb: "Yerleştirme + deneme dersleri. Abonelik sonra.",
  badge: "Başla",
};

/** All plans including free trial (for checkout / picker). */
export const PLANS: PlanOption[] = [TRIAL_PLAN, ...PAID_PLANS];

export function getPlan(id: string | null | undefined): PlanOption | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatPlanPrice(plan: PlanOption): string {
  if (plan.priceTry <= 0) return plan.priceLabel;
  return plan.priceLabel;
}
