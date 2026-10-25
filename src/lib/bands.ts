export type Band = "child" | "teen" | "adult";

export const BAND_LABELS: Record<Band, string> = {
  child: "Çocuk (5–11)",
  teen: "Genç (12–17)",
  adult: "Yetişkin (18+)",
};

export const BAND_SHORT: Record<Band, string> = {
  child: "Çocuk",
  teen: "Genç",
  adult: "Yetişkin",
};

export function defaultSessionMinutes(band: Band): number {
  switch (band) {
    case "child":
      return 10;
    case "teen":
      return 15;
    case "adult":
      return 20;
  }
}

export function isBand(value: string): value is Band {
  return value === "child" || value === "teen" || value === "adult";
}
