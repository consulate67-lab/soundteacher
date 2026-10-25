export type PlanId = "trial" | "monthly" | "yearly";

export type PlanOption = {
  id: PlanId;
  name: string;
  period: string;
  priceLabel: string;
  blurb: string;
  badge?: string;
};

/** Placeholder prices — not real billing amounts. */
export const PLANS: PlanOption[] = [
  {
    id: "trial",
    name: "Deneme",
    period: "7 gün",
    priceLabel: "Ücretsiz deneme",
    blurb: "Yerleştirme + sınırlı ders. Yöntem 2 kotası düşük.",
    badge: "Opsiyonel",
  },
  {
    id: "monthly",
    name: "Aylık",
    period: "ay",
    priceLabel: "₺XXX / ay",
    blurb: "Tüm yaş bantları · piyano omurgası · dinleme yöntemleri.",
  },
  {
    id: "yearly",
    name: "Yıllık",
    period: "yıl",
    priceLabel: "₺XXX / yıl",
    blurb: "Aylık ile aynı içerik; dönem indirimli.",
    badge: "Tasarruf",
  },
];

export function getPlan(id: string | null | undefined): PlanOption | undefined {
  return PLANS.find((p) => p.id === id);
}
