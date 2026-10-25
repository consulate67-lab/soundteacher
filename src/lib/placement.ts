import { defaultSessionMinutes, type Band } from "./bands";

export type Level = "A0" | "A1" | "A2" | "B1";

export type PlacementResult = {
  band: Band;
  level: Level;
  module_entry: number;
  default_session_minutes: number;
};

export type QuestionOption = {
  id: string;
  label: string;
  /** Higher = more advanced signal for scoring categories. */
  score: number;
};

export type PlacementQuestion = {
  id: string;
  category: "experience" | "nota" | "keyboard" | "rhythm" | "technique" | "duration";
  prompt: string;
  options: QuestionOption[];
};

const CHILD_QUESTIONS: PlacementQuestion[] = [
  {
    id: "C1",
    category: "experience",
    prompt: "Hiç piyano veya klavye çaldın mı?",
    options: [
      { id: "none", label: "Hiç", score: 0 },
      { id: "some", label: "Biraz (birkaç ay)", score: 1 },
      { id: "long", label: "Evet, 1 yıldan fazla", score: 2 },
    ],
  },
  {
    id: "C2",
    category: "nota",
    prompt: "Orta Do’nun adı hangisi? (gösterildiğini hayal et)",
    options: [
      { id: "do", label: "Do", score: 2 },
      { id: "re", label: "Re", score: 0 },
      { id: "mi", label: "Mi", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "C4",
    category: "keyboard",
    prompt: "Orta Do hangi tuş? (doğru tuşu seç)",
    options: [
      { id: "a", label: "Sol taraftaki tuş", score: 0 },
      { id: "b", label: "Orta Do (doğru)", score: 2 },
      { id: "c", label: "Sağdaki tuş", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "C5",
    category: "keyboard",
    prompt: "Do–Re–Mi sırası hangisi?",
    options: [
      { id: "ok", label: "Doğru sıra", score: 2 },
      { id: "mix", label: "Karışık sıra", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "C6",
    category: "rhythm",
    prompt: "Hangisi daha uzun ses?",
    options: [
      { id: "short", label: "Kısa", score: 0 },
      { id: "long", label: "Uzun", score: 2 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "C8",
    category: "technique",
    prompt: "İki elinle birden çaldın mı?",
    options: [
      { id: "no", label: "Hayır", score: 0 },
      { id: "some", label: "Biraz", score: 1 },
      { id: "yes", label: "Evet", score: 2 },
    ],
  },
  {
    id: "C11",
    category: "duration",
    prompt: "Haftada ne kadar pratik yapabilirsin?",
    options: [
      { id: "low", label: "Az (≈15–30 dk)", score: 0 },
      { id: "mid", label: "Orta (≈45–60 dk)", score: 1 },
      { id: "high", label: "Çok (1 saatten fazla)", score: 2 },
    ],
  },
];

const TEEN_QUESTIONS: PlacementQuestion[] = [
  {
    id: "G1",
    category: "experience",
    prompt: "Daha önce piyano veya klavye çaldın mı?",
    options: [
      { id: "none", label: "Hiç", score: 0 },
      { id: "some", label: "Birkaç ay", score: 1 },
      { id: "long", label: "1+ yıl", score: 2 },
    ],
  },
  {
    id: "G2",
    category: "nota",
    prompt: "Bu notanın adı nedir? (orta Do)",
    options: [
      { id: "do", label: "Do", score: 2 },
      { id: "re", label: "Re", score: 0 },
      { id: "mi", label: "Mi", score: 0 },
      { id: "idk", label: "Emin değilim", score: 0 },
    ],
  },
  {
    id: "G4",
    category: "keyboard",
    prompt: "Orta Do hangi tuşta?",
    options: [
      { id: "wrong1", label: "Yanlış konum", score: 0 },
      { id: "ok", label: "Doğru tuş", score: 2 },
      { id: "wrong2", label: "Başka oktav", score: 0 },
      { id: "idk", label: "Emin değilim", score: 0 },
    ],
  },
  {
    id: "G5",
    category: "keyboard",
    prompt: "Do–Re–Mi yükselen sırası hangisi?",
    options: [
      { id: "ok", label: "Doğru", score: 2 },
      { id: "bad", label: "Yanlış", score: 0 },
      { id: "idk", label: "Emin değilim", score: 0 },
    ],
  },
  {
    id: "G6",
    category: "rhythm",
    prompt: "Dörtlük ile ikilik farkını biliyor musun?",
    options: [
      { id: "yes", label: "Evet", score: 2 },
      { id: "partial", label: "Kısmen", score: 1 },
      { id: "no", label: "Hayır", score: 0 },
    ],
  },
  {
    id: "G8",
    category: "technique",
    prompt: "İki el birlikte çaldın mı?",
    options: [
      { id: "no", label: "Hayır", score: 0 },
      { id: "start", label: "Başlangıç", score: 1 },
      { id: "yes", label: "Evet, basit parçalar", score: 2 },
    ],
  },
  {
    id: "G11",
    category: "duration",
    prompt: "Haftalık pratik süren yaklaşık ne kadar olabilir?",
    options: [
      { id: "low", label: "<30 dk", score: 0 },
      { id: "mid", label: "30–60 dk", score: 1 },
      { id: "high", label: "60+ dk", score: 2 },
    ],
  },
];

const ADULT_QUESTIONS: PlacementQuestion[] = [
  {
    id: "Yt1",
    category: "experience",
    prompt: "Daha önce piyano veya klavye çaldınız mı?",
    options: [
      { id: "none", label: "Hiç / deneme", score: 0 },
      { id: "some", label: "Birkaç ay", score: 1 },
      { id: "long", label: "1+ yıl (veya yeniden başlıyorum)", score: 2 },
    ],
  },
  {
    id: "Yt2",
    category: "nota",
    prompt: "Bu notanın adı nedir? (orta Do, sol anahtarı)",
    options: [
      { id: "do", label: "Do", score: 2 },
      { id: "re", label: "Re", score: 0 },
      { id: "mi", label: "Mi", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "Yt4",
    category: "keyboard",
    prompt: "Orta Do hangi tuştur?",
    options: [
      { id: "wrong1", label: "Yanlış tuş", score: 0 },
      { id: "ok", label: "Doğru tuş", score: 2 },
      { id: "wrong2", label: "Başka referans", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "Yt5",
    category: "keyboard",
    prompt: "Do–Re–Mi yükselen sırasını seçin",
    options: [
      { id: "ok", label: "Doğru", score: 2 },
      { id: "bad", label: "Yanlış", score: 0 },
      { id: "idk", label: "Bilmiyorum", score: 0 },
    ],
  },
  {
    id: "Yt6",
    category: "rhythm",
    prompt: "Dörtlük ve ikilik süre farkını ayırt edebiliyor musunuz?",
    options: [
      { id: "yes", label: "Evet", score: 2 },
      { id: "partial", label: "Kısmen", score: 1 },
      { id: "no", label: "Hayır", score: 0 },
    ],
  },
  {
    id: "Yt8",
    category: "technique",
    prompt: "İki el birlikte çaldınız mı?",
    options: [
      { id: "no", label: "Hayır", score: 0 },
      { id: "start", label: "Başlangıç düzeyinde", score: 1 },
      { id: "yes", label: "Evet, basit parçalar", score: 2 },
    ],
  },
  {
    id: "Yt11",
    category: "duration",
    prompt: "Haftalık ayırabileceğiniz pratik süresi?",
    options: [
      { id: "low", label: "<45 dk", score: 0 },
      { id: "mid", label: "45–90 dk", score: 1 },
      { id: "high", label: "90+ dk", score: 2 },
    ],
  },
];

export function questionsForBand(band: Band): PlacementQuestion[] {
  switch (band) {
    case "child":
      return CHILD_QUESTIONS;
    case "teen":
      return TEEN_QUESTIONS;
    case "adult":
      return ADULT_QUESTIONS;
  }
}

export type AnswerMap = Record<string, string>;

function optionScore(q: PlacementQuestion, optionId: string): number {
  return q.options.find((o) => o.id === optionId)?.score ?? 0;
}

function moduleEntryFor(level: Level): number {
  switch (level) {
    case "A0":
      return 1;
    case "A1":
      return 2;
    case "A2":
      return 4;
    case "B1":
      return 6;
  }
}

/**
 * Dilim C scoring stub — experience/nota/keyboard heavy; age never raises level alone.
 * Uncertainty biases one level down (built into thresholds).
 */
export function scorePlacement(band: Band, answers: AnswerMap): PlacementResult {
  const questions = questionsForBand(band);
  const byCat = {
    experience: 0,
    nota: 0,
    keyboard: 0,
    rhythm: 0,
    technique: 0,
    duration: 0,
  };
  const counts = { ...byCat };

  for (const q of questions) {
    const s = optionScore(q, answers[q.id] ?? "");
    byCat[q.category] += s;
    counts[q.category] += 1;
  }

  const avg = (cat: keyof typeof byCat) =>
    counts[cat] === 0 ? 0 : byCat[cat] / counts[cat];

  const experience = avg("experience");
  const nota = avg("nota");
  const keyboard = avg("keyboard");
  const rhythm = avg("rhythm");
  const technique = avg("technique");
  const duration = avg("duration");

  let level: Level = "A0";

  if (experience >= 1 && nota >= 1.5 && keyboard >= 1.5) {
    level = "A1";
  }
  if (
    experience >= 1.5 &&
    nota >= 1.5 &&
    keyboard >= 1.5 &&
    technique >= 1 &&
    rhythm >= 1
  ) {
    level = "A2";
  }
  if (
    experience >= 1.5 &&
    nota >= 2 &&
    keyboard >= 2 &&
    technique >= 2 &&
    rhythm >= 1.5
  ) {
    level = "B1";
  }

  // Weak nota/keyboard caps at A0–A1
  if (nota < 1 || keyboard < 1) {
    level = experience >= 1 && nota + keyboard >= 1 ? "A1" : "A0";
    if (nota < 0.5 && keyboard < 0.5) level = "A0";
  }

  let minutes = defaultSessionMinutes(band);
  if (duration >= 2) minutes += 2;
  if (duration === 0) minutes -= 2;
  if (band === "child") minutes = Math.min(12, Math.max(8, minutes));
  if (band === "teen") minutes = Math.min(18, Math.max(12, minutes));
  if (band === "adult") minutes = Math.min(25, Math.max(15, minutes));

  return {
    band,
    level,
    module_entry: moduleEntryFor(level),
    default_session_minutes: minutes,
  };
}

export function needsVerification(level: Level): boolean {
  return level === "A2" || level === "B1";
}

export function levelLabel(level: Level): string {
  return level;
}
