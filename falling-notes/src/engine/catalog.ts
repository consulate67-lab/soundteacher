import type {
  Chart,
  ChartCategory,
  ChartDifficulty,
  ChartLocale,
  NoteEvent,
} from "./types";
import * as Melodies from "./songMelodies";

/** MIDI helpers spanning C3–E5 including black keys. */
export const NOTE = {
  C3: 48,
  Cs3: 49,
  Db3: 49,
  D3: 50,
  Ds3: 51,
  Eb3: 51,
  E3: 52,
  F3: 53,
  Fs3: 54,
  Gb3: 54,
  G3: 55,
  Gs3: 56,
  Ab3: 56,
  A3: 57,
  As3: 58,
  Bb3: 58,
  B3: 59,
  C4: 60,
  Cs4: 61,
  Db4: 61,
  D4: 62,
  Ds4: 63,
  Eb4: 63,
  E4: 64,
  F4: 65,
  Fs4: 66,
  Gb4: 66,
  G4: 67,
  Gs4: 68,
  Ab4: 68,
  A4: 69,
  As4: 70,
  Bb4: 70,
  B4: 71,
  C5: 72,
  Cs5: 73,
  Db5: 73,
  D5: 74,
  Ds5: 75,
  Eb5: 75,
  E5: 76,
  F5: 77,
  Fs5: 78,
  G5: 79,
} as const;

/** One chart step: single pitch or simultaneous dyad/chord (low→high). */
export type MidiHit = number | readonly number[];
type SeqNote = { midi: MidiHit; beats: number };

function expandMidis(hit: MidiHit): number[] {
  return (Array.isArray(hit) ? [...hit] : [hit as number]).map((m) => Math.round(m));
}

export const CATEGORY_LABELS: Record<ChartCategory, string> = {
  gam: "Gam / Dizi",
  teknik: "Teknik Egzersiz",
  cocuk: "Çocuk Şarkısı",
  klasik: "Klasik Motif",
  halk: "Halk Ezgisi",
  populer: "Popüler Motif",
};

export const LOCALE_LABELS: Record<ChartLocale, string> = {
  turkce: "Türkçe",
  yabanci: "Yabancı",
};

export const DIFFICULTY_LABELS: Record<ChartDifficulty, string> = {
  baslangic: "Başlangıç",
  orta: "Orta",
  ileri: "İleri",
};

export const CATEGORY_ORDER: ChartCategory[] = [
  "gam",
  "teknik",
  "cocuk",
  "klasik",
  "halk",
  "populer",
];

export const LOCALE_ORDER: ChartLocale[] = ["turkce", "yabanci"];

export const DIFFICULTY_ORDER: ChartDifficulty[] = ["baslangic", "orta", "ileri"];

/** Turkish folk / Anadolu repertoire ids under Halk (others under Halk are foreign). */
const TURKISH_HALK_IDS = new Set([
  "anadolu-besli",
  "karadeniz-motif",
  "ege-zeybek-sade",
  "rumeli-ezgi",
  "uzun-hava-sade",
  "daglar-kizi-reyhan",
  "uskudara-gideriken",
  "entarisi-ala",
  "cayelinden-ote",
  "allisimin-kaslari",
  "alli-turnam",
  "sari-gelin",
  "yemen-turkusu",
  "cirpinirdi-karadeniz",
  "uzun-ince-yol",
  "ada-sahilleri",
  "felek-cakmagi",
]);

/** Resolve Türkçe vs Yabancı for list grouping. */
export function resolveChartLocale(
  id: string,
  category: ChartCategory,
  locale?: ChartLocale,
): ChartLocale {
  if (locale) return locale;
  if (category === "gam" || category === "teknik") return "turkce";
  if (category === "halk" && TURKISH_HALK_IDS.has(id)) return "turkce";
  return "yabanci";
}

export function buildChart(
  id: string,
  title: string,
  bpm: number,
  seq: SeqNote[],
  category: ChartCategory,
  difficulty: ChartDifficulty,
  leadInBeats = 1,
  locale?: ChartLocale,
): Chart {
  const beat = 60 / bpm;
  let t = leadInBeats * beat;
  const notes: NoteEvent[] = [];
  let step = 0;
  for (const n of seq) {
    const duration = n.beats * beat;
    const midis = expandMidis(n.midi);
    const chordId = midis.length > 1 ? `${id}-c${step}` : undefined;
    midis.forEach((midi, voice) => {
      notes.push({
        id: `${id}-n${step}${midis.length > 1 ? `v${voice}` : ""}`,
        time: t,
        duration,
        midi,
        chordId,
      });
    });
    t += duration;
    step++;
  }
  return {
    id,
    title,
    bpm,
    notes,
    category,
    difficulty,
    locale: resolveChartLocale(id, category, locale),
  };
}

function scaleAscDesc(root: number, intervals: number[], beats = 1): SeqNote[] {
  const up = intervals.map((iv) => ({ midi: root + iv, beats }));
  const top = { midi: root + 12, beats: beats * 2 };
  const down = [...intervals]
    .reverse()
    .slice(1)
    .map((iv) => ({ midi: root + iv, beats }));
  const end = { midi: root, beats: beats * 2 };
  return [...up, top, ...down, end];
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const PENTA = [0, 2, 4, 7, 9];

function arpeggio(root: number, quality: "maj" | "min" | "dom7"): SeqNote[] {
  const iv =
    quality === "maj"
      ? [0, 4, 7, 12]
      : quality === "min"
        ? [0, 3, 7, 12]
        : [0, 4, 7, 10, 12];
  const up = iv.map((i, idx) => ({
    midi: root + i,
    beats: idx === iv.length - 1 ? 2 : 1,
  }));
  const down = [...iv]
    .reverse()
    .slice(1)
    .map((i, idx, arr) => ({
      midi: root + i,
      beats: idx === arr.length - 1 ? 2 : 1,
    }));
  return [...up, ...down];
}

function pattern(midis: MidiHit[], beats: number | number[]): SeqNote[] {
  return midis.map((midi, i) => ({
    midi,
    beats: Array.isArray(beats) ? (beats[i] ?? beats[beats.length - 1] ?? 1) : beats,
  }));
}

function transposeHit(hit: MidiHit, semitones: number): MidiHit {
  if (Array.isArray(hit)) return hit.map((m) => m + semitones);
  return (hit as number) + semitones;
}

function transposeSeq(seq: SeqNote[], semitones: number): SeqNote[] {
  return seq.map((n) => ({ midi: transposeHit(n.midi, semitones), beats: n.beats }));
}

/** Hand-authored PD / traditional motifs + generated drills → ≥100 charts. */
function buildCatalog(): Chart[] {
  const charts: Chart[] = [];
  const add = (c: Chart) => charts.push(c);

  // ——— Existing favorites (white + black-key aware) ———
  add(
    buildChart(
      "do-re-mi-egzersizi",
      "Do–Re–Mi Egzersizi",
      80,
      pattern(
        [
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C5,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2],
      ),
      "teknik",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "kucuk-yildiz",
      "Küçük Yıldız (Twinkle)",
      90,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.F4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
          NOTE.G4,
          NOTE.G4,
          NOTE.F4,
          NOTE.F4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.F4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
        ],
        [
          1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1,
          2, 1, 1, 1, 1, 1, 1, 2,
        ],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "mary-kuzu",
      "Mary’nin Kuzusu",
      92,
      pattern(
        [
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.D4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "sicak-corekler",
      "Sıcak Çörekler (Hot Cross Buns)",
      88,
      pattern(
        [
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.D4,
          NOTE.D4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 2, 1, 1, 2, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "neseye-ovgu",
      "Neşeye Övgü (Ode to Joy)",
      86,
      pattern(
        [
          NOTE.E4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
        ],
        [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
          1, 1, 1.5, 0.5, 2,
        ],
      ),
      "klasik",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "yankee-doodle",
      "Yankee Doodle",
      100,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.B3,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.B3,
          NOTE.G3,
          NOTE.A3,
          NOTE.B3,
          NOTE.C4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "jingil-ziller",
      "Şıngırdak Ziller (Jingle Bells)",
      100,
      pattern(
        [
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.F4,
          NOTE.F4,
          NOTE.F4,
          NOTE.F4,
          NOTE.F4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.G4,
        ],
        [
          1, 1, 2, 1, 1, 2, 1, 1, 1.5, 0.5, 4, 1, 1, 1.5, 0.5, 1, 1, 1, 0.5, 0.5, 1, 1, 1,
          1, 2, 2,
        ],
      ),
      "cocuk",
      "orta",
    ),
  );

  // ——— Major / minor scales (many with black keys) ———
  const majorSpecs: { id: string; title: string; root: number; diff: ChartDifficulty }[] =
    [
      {
        id: "gam-c-maj",
        title: "Do Majör Gam (Do1–Do2)",
        root: NOTE.C4,
        diff: "baslangic",
      },
      { id: "gam-g-maj", title: "Sol Majör Gam (Fa#)", root: NOTE.G3, diff: "baslangic" },
      { id: "gam-d-maj", title: "Re Majör Gam (Fa# Do#)", root: NOTE.D4, diff: "orta" },
      { id: "gam-a-maj", title: "La Majör Gam (3 diyez)", root: NOTE.A3, diff: "orta" },
      { id: "gam-e-maj", title: "Mi Majör Gam (4 diyez)", root: NOTE.E4, diff: "ileri" },
      { id: "gam-f-maj", title: "Fa Majör Gam (Sib)", root: NOTE.F3, diff: "baslangic" },
      {
        id: "gam-bb-maj",
        title: "Sib Majör Gam (2 bemol)",
        root: NOTE.Bb3,
        diff: "orta",
      },
      {
        id: "gam-eb-maj",
        title: "Mib Majör Gam (3 bemol)",
        root: NOTE.Eb4,
        diff: "ileri",
      },
      { id: "gam-b-maj", title: "Si Majör Gam (5 diyez)", root: NOTE.B3, diff: "ileri" },
      { id: "gam-fs-maj", title: "Fa# Majör Gam", root: NOTE.Fs3, diff: "ileri" },
      { id: "gam-ab-maj", title: "Lab Majör Gam", root: NOTE.Ab3, diff: "ileri" },
      { id: "gam-db-maj", title: "Reb Majör Gam", root: NOTE.Db4, diff: "ileri" },
    ];
  for (const s of majorSpecs) {
    add(buildChart(s.id, s.title, 72, scaleAscDesc(s.root, MAJOR), "gam", s.diff));
  }

  const minorSpecs: { id: string; title: string; root: number; diff: ChartDifficulty }[] =
    [
      { id: "gam-a-min", title: "La Minör Gam", root: NOTE.A3, diff: "baslangic" },
      { id: "gam-e-min", title: "Mi Minör Gam (Fa#)", root: NOTE.E4, diff: "baslangic" },
      { id: "gam-d-min", title: "Re Minör Gam (Sib)", root: NOTE.D4, diff: "baslangic" },
      { id: "gam-b-min", title: "Si Minör Gam", root: NOTE.B3, diff: "orta" },
      { id: "gam-g-min", title: "Sol Minör Gam", root: NOTE.G3, diff: "orta" },
      { id: "gam-c-min", title: "Do Minör Gam", root: NOTE.C4, diff: "orta" },
      { id: "gam-fs-min", title: "Fa# Minör Gam", root: NOTE.Fs3, diff: "ileri" },
      { id: "gam-cs-min", title: "Do# Minör Gam", root: NOTE.Cs4, diff: "ileri" },
    ];
  for (const s of minorSpecs) {
    add(buildChart(s.id, s.title, 70, scaleAscDesc(s.root, MINOR), "gam", s.diff));
  }

  add(
    buildChart(
      "gam-penta-c",
      "Do Pentatonik Gam",
      76,
      scaleAscDesc(NOTE.C4, PENTA, 1),
      "gam",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "gam-penta-g",
      "Sol Pentatonik Gam",
      76,
      scaleAscDesc(NOTE.G3, PENTA, 1),
      "gam",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "gam-kromotik-c",
      "Do Kromatik (siyah+beyaz)",
      66,
      pattern(
        [
          NOTE.C4,
          NOTE.Cs4,
          NOTE.D4,
          NOTE.Ds4,
          NOTE.E4,
          NOTE.F4,
          NOTE.Fs4,
          NOTE.G4,
          NOTE.Gs4,
          NOTE.A4,
          NOTE.As4,
          NOTE.B4,
          NOTE.C5,
          NOTE.B4,
          NOTE.As4,
          NOTE.A4,
          NOTE.Gs4,
          NOTE.G4,
          NOTE.Fs4,
          NOTE.F4,
          NOTE.E4,
          NOTE.Ds4,
          NOTE.D4,
          NOTE.Cs4,
          NOTE.C4,
        ],
        1,
      ),
      "gam",
      "ileri",
    ),
  );

  // ——— Black-key focused technique ———
  add(
    buildChart(
      "siyah-tus-giris",
      "Siyah Tuş Giriş (Fa# Sol#)",
      70,
      pattern(
        [
          NOTE.Fs4,
          NOTE.Fs4,
          NOTE.Gs4,
          NOTE.Gs4,
          NOTE.Fs4,
          NOTE.E4,
          NOTE.Fs4,
          NOTE.Gs4,
          NOTE.As4,
          NOTE.Gs4,
          NOTE.Fs4,
          NOTE.Fs4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 2],
      ),
      "teknik",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "siyah-tus-cift",
      "Siyah Tuş Çiftleri (Do# Re# Fa#)",
      68,
      pattern(
        [
          NOTE.Cs4,
          NOTE.Ds4,
          NOTE.Cs4,
          NOTE.Ds4,
          NOTE.Fs4,
          NOTE.Fs4,
          NOTE.Ds4,
          NOTE.Cs4,
          NOTE.Fs4,
          NOTE.Gs4,
          NOTE.Fs4,
          NOTE.Ds4,
          NOTE.Cs4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "teknik",
      "orta",
    ),
  );
  add(
    buildChart(
      "siyah-tus-tum",
      "Tüm Siyah Tuşlar (bir oktav)",
      64,
      pattern(
        [
          NOTE.Cs4,
          NOTE.Ds4,
          NOTE.Fs4,
          NOTE.Gs4,
          NOTE.As4,
          NOTE.Cs5,
          NOTE.As4,
          NOTE.Gs4,
          NOTE.Fs4,
          NOTE.Ds4,
          NOTE.Cs4,
        ],
        [1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2],
      ),
      "teknik",
      "orta",
    ),
  );
  add(
    buildChart(
      "bemol-giris",
      "Bemol Giriş (Sib Mib)",
      70,
      pattern(
        [
          NOTE.Bb3,
          NOTE.C4,
          NOTE.D4,
          NOTE.Eb4,
          NOTE.F4,
          NOTE.Eb4,
          NOTE.D4,
          NOTE.C4,
          NOTE.Bb3,
          NOTE.Eb4,
          NOTE.F4,
          NOTE.Bb3,
        ],
        [1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 1, 2],
      ),
      "teknik",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "diyez-merdiven",
      "Diyez Merdiven (Fa# Do# Sol#)",
      74,
      pattern(
        [
          NOTE.E4,
          NOTE.Fs4,
          NOTE.Gs4,
          NOTE.A4,
          NOTE.B4,
          NOTE.Cs5,
          NOTE.B4,
          NOTE.A4,
          NOTE.Gs4,
          NOTE.Fs4,
          NOTE.E4,
        ],
        1,
      ),
      "teknik",
      "orta",
    ),
  );

  // Holds / duration drills
  add(
    buildChart(
      "tutma-yarim",
      "Tutma: Yarım Notalar",
      60,
      pattern([NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5, NOTE.G4, NOTE.E4, NOTE.C4], 2),
      "teknik",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "tutma-birlik",
      "Tutma: Birlik Notalar",
      50,
      pattern([NOTE.C4, NOTE.G4, NOTE.E4, NOTE.C4], 4),
      "teknik",
      "baslangic",
    ),
  );
  add(
    buildChart(
      "tutma-karisik",
      "Tutma: Karışık Süreler",
      70,
      pattern(
        [NOTE.C4, NOTE.D4, NOTE.E4, NOTE.F4, NOTE.G4, NOTE.A4, NOTE.G4, NOTE.C5],
        [1, 1, 2, 0.5, 0.5, 1, 2, 4],
      ),
      "teknik",
      "orta",
    ),
  );
  add(
    buildChart(
      "tutma-siyah",
      "Tutma: Siyah Tuş Uzunları",
      58,
      pattern([NOTE.Fs4, NOTE.Gs4, NOTE.As4, NOTE.Gs4, NOTE.Fs4], [2, 2, 4, 2, 4]),
      "teknik",
      "orta",
    ),
  );

  // Arpeggios
  for (const [name, root, q, diff] of [
    ["arp-c-maj", NOTE.C4, "maj", "baslangic"],
    ["arp-g-maj", NOTE.G3, "maj", "baslangic"],
    ["arp-d-maj", NOTE.D4, "maj", "orta"],
    ["arp-a-min", NOTE.A3, "min", "baslangic"],
    ["arp-e-min", NOTE.E4, "min", "orta"],
    ["arp-f-maj", NOTE.F3, "maj", "baslangic"],
    ["arp-bb-maj", NOTE.Bb3, "maj", "orta"],
    ["arp-fs-min", NOTE.Fs3, "min", "ileri"],
    ["arp-g7", NOTE.G3, "dom7", "orta"],
    ["arp-d7", NOTE.D4, "dom7", "ileri"],
  ] as const) {
    const titles: Record<string, string> = {
      "arp-c-maj": "Do Majör Arpej",
      "arp-g-maj": "Sol Majör Arpej (Fa#)",
      "arp-d-maj": "Re Majör Arpej",
      "arp-a-min": "La Minör Arpej",
      "arp-e-min": "Mi Minör Arpej",
      "arp-f-maj": "Fa Majör Arpej (Sib)",
      "arp-bb-maj": "Sib Majör Arpej",
      "arp-fs-min": "Fa# Minör Arpej",
      "arp-g7": "Sol7 Arpej",
      "arp-d7": "Re7 Arpej",
    };
    add(buildChart(name, titles[name]!, 78, arpeggio(root, q), "teknik", diff));
  }

  add(
    buildChart(
      "ucuncu-c",
      "Üçlüler (Do–Mi–Sol)",
      80,
      pattern(
        [
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.F4,
          NOTE.E4,
          NOTE.G4,
          NOTE.F4,
          NOTE.A4,
          NOTE.G4,
          NOTE.B4,
          NOTE.A4,
          NOTE.C5,
          NOTE.G4,
          NOTE.C4,
        ],
        1,
      ),
      "teknik",
      "orta",
    ),
  );
  add(
    buildChart(
      "besli-c",
      "Beşliler (Do–Sol)",
      76,
      pattern(
        [NOTE.C4, NOTE.G4, NOTE.D4, NOTE.A4, NOTE.E4, NOTE.B4, NOTE.F4, NOTE.C5, NOTE.C4],
        [1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "teknik",
      "orta",
    ),
  );

  // ——— More children's PD songs ———
  const londonBridge = pattern(
    [
      NOTE.G4,
      NOTE.A4,
      NOTE.G4,
      NOTE.F4,
      NOTE.E4,
      NOTE.F4,
      NOTE.G4,
      NOTE.D4,
      NOTE.E4,
      NOTE.F4,
      NOTE.E4,
      NOTE.F4,
      NOTE.G4,
      NOTE.G4,
      NOTE.A4,
      NOTE.G4,
      NOTE.F4,
      NOTE.E4,
      NOTE.F4,
      NOTE.G4,
      NOTE.D4,
      NOTE.G4,
      NOTE.E4,
      NOTE.C4,
    ],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2],
  );
  add(
    buildChart("london-bridge", "London Bridge", 92, londonBridge, "cocuk", "baslangic"),
  );

  add(
    buildChart(
      "row-boat",
      "Row Row Row Your Boat",
      88,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.C5,
          NOTE.C5,
          NOTE.C5,
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [
          1, 1, 1, 1, 2, 1, 1, 1, 1, 4, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5,
          1, 1, 1, 1, 1, 2,
        ],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "frere-jacques",
      "Frère Jacques (Are You Sleeping)",
      90,
      pattern(
        [
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.C4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.C4,
          NOTE.C4,
          NOTE.G3,
          NOTE.C4,
          NOTE.C4,
          NOTE.G3,
          NOTE.C4,
        ],
        [
          1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 0.5, 0.5, 0.5, 0.5, 1, 1, 0.5, 0.5,
          0.5, 0.5, 1, 1, 1, 1, 2, 1, 1, 2,
        ],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "lightly-row",
      "Lightly Row",
      96,
      pattern(
        [
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "au-clair",
      "Au Clair de la Lune",
      80,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 4, 1, 1, 1, 1, 2, 2, 1, 1, 1, 4],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "muffin-man",
      "Do You Know the Muffin Man",
      94,
      pattern(
        [
          NOTE.G4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.E4,
          NOTE.F4,
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "itsy-bitsy",
      "Itsy Bitsy Spider (motif)",
      88,
      pattern(
        [
          NOTE.G4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "old-macdonald",
      "Old MacDonald (motif)",
      100,
      pattern(
        [
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.B4,
          NOTE.B4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "this-old-man",
      "This Old Man (motif)",
      96,
      pattern(
        [
          NOTE.G4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  // Lavender's Blue transposed to include F#
  add(
    buildChart(
      "lavender-blue",
      "Lavender’s Blue (Sol majör)",
      84,
      pattern(
        [
          NOTE.D4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.B4,
          NOTE.B4,
          NOTE.A4,
          NOTE.G4,
          NOTE.Fs4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.B4,
          NOTE.B4,
          NOTE.A4,
          NOTE.G4,
          NOTE.D4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "orta",
    ),
  );

  // Skip to my Lou with Bb
  add(
    buildChart(
      "skip-lou",
      "Skip to My Lou (Fa majör)",
      100,
      pattern(
        [
          NOTE.F4,
          NOTE.F4,
          NOTE.A4,
          NOTE.C5,
          NOTE.Bb4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.F4,
          NOTE.A4,
          NOTE.C5,
          NOTE.C5,
          NOTE.Bb4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "orta",
    ),
  );

  add(
    buildChart(
      "bingo",
      "B-I-N-G-O (motif)",
      100,
      pattern(
        [
          NOTE.G4,
          NOTE.C4,
          NOTE.C4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "cocuk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "alphabet-song",
      "Alphabet Song (= Twinkle varyant)",
      90,
      transposeSeq(
        pattern(
          [
            NOTE.C4,
            NOTE.C4,
            NOTE.G4,
            NOTE.G4,
            NOTE.A4,
            NOTE.A4,
            NOTE.G4,
            NOTE.F4,
            NOTE.F4,
            NOTE.E4,
            NOTE.E4,
            NOTE.D4,
            NOTE.D4,
            NOTE.C4,
          ],
          [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
        ),
        0,
      ),
      "cocuk",
      "baslangic",
    ),
  );

  // ——— Classical PD motifs ———
  add(
    buildChart(
      "mozart-twinkle",
      "Mozart: Twinkle Varyasyon Motifi",
      100,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.F4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
          NOTE.C4,
        ],
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "fur-elise-motif",
      "Für Elise (açılış motifi)",
      72,
      pattern(
        [
          NOTE.E4,
          NOTE.Ds4,
          NOTE.E4,
          NOTE.Ds4,
          NOTE.E4,
          NOTE.B3,
          NOTE.D4,
          NOTE.C4,
          NOTE.A3,
          NOTE.C4,
          NOTE.E4,
          NOTE.A4,
          NOTE.B4,
          NOTE.E4,
          NOTE.Gs4,
          NOTE.B4,
          NOTE.C5,
        ],
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 1, 1, 0.5, 0.5, 0.5, 1],
      ),
      "klasik",
      "ileri",
    ),
  );

  add(
    buildChart(
      "minuet-g-bach",
      "Bach: Minuet in G (açılış)",
      88,
      pattern(
        [
          NOTE.D4,
          NOTE.G4,
          NOTE.A4,
          NOTE.B4,
          NOTE.C5,
          NOTE.D5,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C5,
          NOTE.B4,
          NOTE.A4,
          NOTE.D4,
          NOTE.D4,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "canon-pachelbel",
      "Pachelbel Canon (bas motifi)",
      70,
      pattern(
        [NOTE.D4, NOTE.A3, NOTE.B3, NOTE.Fs3, NOTE.G3, NOTE.D3, NOTE.G3, NOTE.A3],
        2,
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "haydn-surprise",
      "Haydn: Sürpriz Senfoni (motif)",
      90,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.F4,
          NOTE.F4,
          NOTE.D4,
          NOTE.D4,
          NOTE.B3,
          NOTE.B3,
          NOTE.G3,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "brahms-lullaby",
      "Brahms Ninni (açılış)",
      76,
      pattern(
        [
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.E4,
          NOTE.G4,
          NOTE.C5,
          NOTE.B4,
          NOTE.A4,
          NOTE.A4,
          NOTE.G4,
        ],
        [1, 1, 2, 1, 1, 2, 0.5, 0.5, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "blue-danube",
      "Mavi Tuna (vals motifi)",
      100,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C4,
          NOTE.G3,
          NOTE.C4,
          NOTE.E4,
          NOTE.G4,
          NOTE.C5,
        ],
        [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "new-world",
      "Dvořák: Yeni Dünya (tema)",
      72,
      pattern(
        [
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.D4,
        ],
        [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "william-tell",
      "William Tell (galop motifi)",
      120,
      pattern(
        [
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.C4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C4,
        ],
        [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 2],
      ),
      "klasik",
      "ileri",
    ),
  );

  add(
    buildChart(
      "toccata-dmin",
      "Bach: Toccata d-minör (açılış)",
      66,
      pattern(
        [
          NOTE.A4,
          NOTE.G4,
          NOTE.A4,
          NOTE.Bb4,
          NOTE.Cs5,
          NOTE.D5,
          NOTE.A4,
          NOTE.G4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
        ],
        [0.5, 0.5, 1, 1, 1, 2, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "ileri",
    ),
  );

  add(
    buildChart(
      "air-g-string",
      "Bach: Air (bas çizgisi sade)",
      60,
      pattern(
        [NOTE.D4, NOTE.Fs4, NOTE.A4, NOTE.D5, NOTE.A4, NOTE.Fs4, NOTE.D4],
        [2, 2, 2, 2, 2, 2, 4],
      ),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "greensleeves",
      "Greensleeves (açılış)",
      78,
      pattern(
        [
          NOTE.A3,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.F4,
          NOTE.E4,
          NOTE.D4,
          NOTE.B3,
          NOTE.G3,
          NOTE.A3,
          NOTE.B3,
          NOTE.C4,
          NOTE.A3,
        ],
        [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "klasik",
      "orta",
    ),
  );

  // ——— Folk / halk ———
  add(
    buildChart(
      "scaraovee",
      "Scarborough Fair (motif)",
      80,
      pattern(
        [
          NOTE.A3,
          NOTE.A3,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.E4,
          NOTE.G4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.A3,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "oh-susanna",
      "Oh! Susanna (açılış)",
      108,
      pattern(
        [
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.G4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "camptown",
      "Camptown Races (motif)",
      110,
      pattern(
        [
          NOTE.G4,
          NOTE.G4,
          NOTE.E4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.E4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "simple-gifts",
      "Simple Gifts (Shaker)",
      92,
      pattern(
        [
          NOTE.G3,
          NOTE.C4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.D4,
          NOTE.E4,
          NOTE.C4,
          NOTE.A3,
          NOTE.G3,
        ],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "amazing-grace",
      "Amazing Grace (motif)",
      72,
      pattern(
        [
          NOTE.G3,
          NOTE.C4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.C4,
          NOTE.A3,
          NOTE.G3,
          NOTE.C4,
          NOTE.E4,
          NOTE.C4,
          NOTE.E4,
          NOTE.D4,
          NOTE.E4,
          NOTE.G4,
        ],
        [1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "sakura",
      "Sakura (Japon halk)",
      70,
      pattern(
        [
          NOTE.A4,
          NOTE.A4,
          NOTE.C5,
          NOTE.A4,
          NOTE.A4,
          NOTE.C5,
          NOTE.A4,
          NOTE.G4,
          NOTE.A4,
          NOTE.G4,
          NOTE.E4,
          NOTE.E4,
          NOTE.G4,
          NOTE.E4,
        ],
        [1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2],
      ),
      "halk",
      "orta",
    ),
  );

  // Turkish folk / Anadolu pedagogical (expanded sequences)
  add(
    buildChart(
      "anadolu-besli",
      "Anadolu Beşli Ezgi (pedagojik)",
      96,
      pattern(Melodies.ANADOLU.midis, Melodies.ANADOLU.beats),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "karadeniz-motif",
      "Karadeniz Motifi (pedagojik)",
      120,
      pattern(Melodies.KARADENIZ.midis, Melodies.KARADENIZ.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "ege-zeybek-sade",
      "Ege Zeybek (sade pedagojik)",
      66,
      pattern(Melodies.EGE.midis, Melodies.EGE.beats),
      "halk",
      "ileri",
    ),
  );

  add(
    buildChart(
      "rumeli-ezgi",
      "Rumeli Ezgi (pedagojik)",
      100,
      pattern(Melodies.RUMELI.midis, Melodies.RUMELI.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "uzun-hava-sade",
      "Uzun Hava (sade tutuş)",
      52,
      pattern(Melodies.UZUN_HAVA.midis, Melodies.UZUN_HAVA.beats),
      "halk",
      "ileri",
    ),
  );

  // ——— Extra Turkish folk (Halk) — fuller pedagogical arrangements ———
  add(
    buildChart(
      "daglar-kizi-reyhan",
      "Dağlar Kızı Reyhan",
      116,
      pattern(Melodies.DAGLAR_KIZI_REYHAN.midis, Melodies.DAGLAR_KIZI_REYHAN.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "uskudara-gideriken",
      "Üsküdar’a Gider İken (Kâtibim)",
      112,
      pattern(Melodies.USKUDARA.midis, Melodies.USKUDARA.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "entarisi-ala",
      "Entarisi Ala Benziyor",
      126,
      pattern(Melodies.ENTARISI.midis, Melodies.ENTARISI.beats),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "cayelinden-ote",
      "Çayelinden Öteye",
      112,
      pattern(Melodies.CAYELINDEN.midis, Melodies.CAYELINDEN.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "allisimin-kaslari",
      "Alişimin Kaşları",
      116,
      pattern(Melodies.ALLISIMIN.midis, Melodies.ALLISIMIN.beats),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "alli-turnam",
      "Allı Turnam",
      100,
      pattern(Melodies.ALLI_TURNAM.midis, Melodies.ALLI_TURNAM.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "sari-gelin",
      "Sarı Gelin",
      80,
      pattern(Melodies.SARI_GELIN.midis, Melodies.SARI_GELIN.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "yemen-turkusu",
      "Yemen Türküsü",
      76,
      pattern(Melodies.YEMEN.midis, Melodies.YEMEN.beats),
      "halk",
      "ileri",
    ),
  );

  add(
    buildChart(
      "cirpinirdi-karadeniz",
      "Çırpınırdı Karadeniz",
      104,
      pattern(Melodies.CIRPINIRDI.midis, Melodies.CIRPINIRDI.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "uzun-ince-yol",
      "Uzun İnce Bir Yoldayım",
      84,
      pattern(Melodies.UZUN_INCE.midis, Melodies.UZUN_INCE.beats),
      "halk",
      "orta",
    ),
  );

  add(
    buildChart(
      "ada-sahilleri",
      "Ada Sahilleri",
      108,
      pattern(Melodies.ADA_SAHILLERI.midis, Melodies.ADA_SAHILLERI.beats),
      "halk",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "felek-cakmagi",
      "Felek Çakmağını Taktı",
      104,
      pattern(Melodies.FELEK.midis, Melodies.FELEK.beats),
      "halk",
      "orta",
    ),
  );

  // ——— Popular / well-known foreign fuller pedagogical arrangements ———
  add(
    buildChart(
      "happy-birthday",
      "Mutlu Yıllar (Happy Birthday)",
      120,
      pattern(Melodies.HAPPY_BIRTHDAY.midis, Melodies.HAPPY_BIRTHDAY.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "when-the-saints",
      "When the Saints",
      132,
      pattern(Melodies.WHEN_THE_SAINTS.midis, Melodies.WHEN_THE_SAINTS.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "bella-ciao",
      "Bella Ciao",
      120,
      pattern(Melodies.BELLA_CIAO.midis, Melodies.BELLA_CIAO.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "la-bamba",
      "La Bamba",
      140,
      pattern(Melodies.LA_BAMBA.midis, Melodies.LA_BAMBA.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "guantanamera",
      "Guantanamera",
      108,
      pattern(Melodies.GUANTANAMERA.midis, Melodies.GUANTANAMERA.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "el-condor-pasa",
      "El Cóndor Pasa",
      92,
      pattern(Melodies.EL_CONDOR.midis, Melodies.EL_CONDOR.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "hava-nagila",
      "Hava Nagila",
      144,
      pattern(Melodies.HAVA_NAGILA.midis, Melodies.HAVA_NAGILA.beats),
      "populer",
      "ileri",
    ),
  );

  add(
    buildChart(
      "kalinka",
      "Kalinka",
      120,
      pattern(Melodies.KALINKA.midis, Melodies.KALINKA.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "korobeiniki",
      "Korobeiniki / Tetris",
      150,
      pattern(Melodies.KOROBEINIKI.midis, Melodies.KOROBEINIKI.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "house-rising-sun",
      "House of the Rising Sun",
      88,
      pattern(Melodies.HOUSE_RISING.midis, Melodies.HOUSE_RISING.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "let-it-be-motif",
      "Let It Be (öğretim)",
      76,
      pattern(Melodies.LET_IT_BE.midis, Melodies.LET_IT_BE.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "imagine-motif",
      "Imagine (öğretim)",
      78,
      pattern(Melodies.IMAGINE.midis, Melodies.IMAGINE.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "yesterday-motif",
      "Yesterday (öğretim)",
      88,
      pattern(Melodies.YESTERDAY.midis, Melodies.YESTERDAY.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "perfect-motif",
      "Perfect (öğretim)",
      96,
      pattern(Melodies.PERFECT.midis, Melodies.PERFECT.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "someone-like-you-motif",
      "Someone Like You (öğretim)",
      76,
      pattern(Melodies.SOMEONE_LIKE_YOU.midis, Melodies.SOMEONE_LIKE_YOU.beats),
      "populer",
      "ileri",
    ),
  );

  add(
    buildChart(
      "shallow-motif",
      "Shallow (öğretim)",
      100,
      pattern(Melodies.SHALLOW.midis, Melodies.SHALLOW.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "blinding-lights-motif",
      "Blinding Lights (öğretim)",
      171,
      pattern(Melodies.BLINDING_LIGHTS.midis, Melodies.BLINDING_LIGHTS.beats),
      "populer",
      "ileri",
    ),
  );

  add(
    buildChart(
      "as-it-was-motif",
      "As It Was (öğretim)",
      174,
      pattern(Melodies.AS_IT_WAS.midis, Melodies.AS_IT_WAS.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "flowers-motif",
      "Flowers (öğretim)",
      118,
      pattern(Melodies.FLOWERS.midis, Melodies.FLOWERS.beats),
      "populer",
      "orta",
    ),
  );

  add(
    buildChart(
      "stay-rixton-motif",
      "Stay (öğretim)",
      120,
      pattern(Melodies.STAY.midis, Melodies.STAY.beats),
      "populer",
      "baslangic",
    ),
  );

  add(
    buildChart(
      "despacito-motif",
      "Despacito (öğretim)",
      134,
      pattern(Melodies.DESPACITO.midis, Melodies.DESPACITO.beats),
      "populer",
      "ileri",
    ),
  );

  // Fill to ≥100 with systematic short drills (white + black keys)
  const drillRoots: { name: string; root: number; black: boolean }[] = [
    { name: "Do", root: NOTE.C4, black: false },
    { name: "Re", root: NOTE.D4, black: false },
    { name: "Mi", root: NOTE.E4, black: false },
    { name: "Fa", root: NOTE.F4, black: false },
    { name: "Sol", root: NOTE.G4, black: false },
    { name: "La", root: NOTE.A4, black: false },
    { name: "Si", root: NOTE.B3, black: false },
    { name: "Do#", root: NOTE.Cs4, black: true },
    { name: "Re#", root: NOTE.Ds4, black: true },
    { name: "Fa#", root: NOTE.Fs4, black: true },
    { name: "Sol#", root: NOTE.Gs4, black: true },
    { name: "Sib", root: NOTE.Bb3, black: true },
    { name: "Mib", root: NOTE.Eb4, black: true },
  ];

  for (const d of drillRoots) {
    const id = `tek-nota-${d.root}`;
    add(
      buildChart(
        id,
        `Tek Nota Tutuş: ${d.name}${d.black ? " (siyah)" : ""}`,
        55,
        pattern([d.root, d.root, d.root, d.root], [2, 2, 4, 4]),
        "teknik",
        d.black ? "orta" : "baslangic",
      ),
    );
  }

  for (const d of drillRoots.slice(0, 8)) {
    add(
      buildChart(
        `komsu-${d.root}`,
        `Komşu Sesler: ${d.name}`,
        80,
        pattern(
          [d.root, d.root + 1, d.root, d.root - 1, d.root, d.root + 2, d.root, d.root],
          [1, 1, 1, 1, 1, 1, 2, 2],
        ),
        "teknik",
        "orta",
      ),
    );
  }

  // Short songlets transposed into black-key keys
  const twinkleCore = pattern(
    [
      NOTE.C4,
      NOTE.C4,
      NOTE.G4,
      NOTE.G4,
      NOTE.A4,
      NOTE.A4,
      NOTE.G4,
      NOTE.F4,
      NOTE.F4,
      NOTE.E4,
      NOTE.E4,
      NOTE.D4,
      NOTE.D4,
      NOTE.C4,
    ],
    [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2],
  );
  add(
    buildChart(
      "twinkle-g",
      "Küçük Yıldız (Sol majör / Fa#)",
      90,
      transposeSeq(twinkleCore, 7),
      "cocuk",
      "orta",
    ),
  );
  add(
    buildChart(
      "twinkle-f",
      "Küçük Yıldız (Fa majör / Sib)",
      90,
      transposeSeq(twinkleCore, 5),
      "cocuk",
      "orta",
    ),
  );
  add(
    buildChart(
      "twinkle-d",
      "Küçük Yıldız (Re majör / diyezler)",
      90,
      transposeSeq(twinkleCore, 2),
      "cocuk",
      "ileri",
    ),
  );

  const odeCore = pattern(
    [
      NOTE.E4,
      NOTE.E4,
      NOTE.F4,
      NOTE.G4,
      NOTE.G4,
      NOTE.F4,
      NOTE.E4,
      NOTE.D4,
      NOTE.C4,
      NOTE.C4,
      NOTE.D4,
      NOTE.E4,
      NOTE.E4,
      NOTE.D4,
      NOTE.D4,
    ],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5, 0.5, 2],
  );
  add(
    buildChart(
      "ode-g",
      "Neşeye Övgü (Sol majör)",
      86,
      transposeSeq(odeCore, 7),
      "klasik",
      "orta",
    ),
  );
  add(
    buildChart(
      "ode-f",
      "Neşeye Övgü (Fa majör / Sib)",
      86,
      transposeSeq(odeCore, 5),
      "klasik",
      "orta",
    ),
  );

  add(
    buildChart(
      "hot-cross-g",
      "Sıcak Çörekler (Sol / Fa#)",
      88,
      transposeSeq(
        pattern(
          [
            NOTE.E4,
            NOTE.D4,
            NOTE.C4,
            NOTE.E4,
            NOTE.D4,
            NOTE.C4,
            NOTE.E4,
            NOTE.D4,
            NOTE.C4,
          ],
          [1, 1, 2, 1, 1, 2, 1, 1, 2],
        ),
        7,
      ),
      "cocuk",
      "orta",
    ),
  );

  add(
    buildChart(
      "mary-g",
      "Mary’nin Kuzusu (Sol / Fa#)",
      92,
      transposeSeq(
        pattern(
          [
            NOTE.E4,
            NOTE.D4,
            NOTE.C4,
            NOTE.D4,
            NOTE.E4,
            NOTE.E4,
            NOTE.E4,
            NOTE.D4,
            NOTE.D4,
            NOTE.D4,
            NOTE.E4,
            NOTE.G4,
            NOTE.G4,
            NOTE.C4,
          ],
          [1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 2],
        ),
        7,
      ),
      "cocuk",
      "orta",
    ),
  );

  // Ensure unique ids and clamp MIDI into keyboard range where possible
  const seen = new Set<string>();
  const cleaned: Chart[] = [];
  for (const c of charts) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    cleaned.push({
      ...c,
      notes: c.notes.map((n) => ({
        ...n,
        midi: Math.min(NOTE.G5, Math.max(NOTE.C3, n.midi)),
      })),
    });
  }
  return cleaned;
}

export const CHARTS: Chart[] = buildCatalog();

export const DEMO_CHART: Chart =
  CHARTS.find((c) => c.id === "do-re-mi-egzersizi") ?? CHARTS[0]!;

export function getChartById(id: string): Chart {
  return CHARTS.find((c) => c.id === id) ?? DEMO_CHART;
}

export function chartHasBlackKeys(chart: Chart): boolean {
  return chart.notes.some((n) => {
    const pc = ((n.midi % 12) + 12) % 12;
    return ![0, 2, 4, 5, 7, 9, 11].includes(pc);
  });
}

export function catalogStats(): {
  total: number;
  byCategory: Record<ChartCategory, number>;
  byDifficulty: Record<ChartDifficulty, number>;
  withBlackKeys: number;
} {
  const byCategory = {
    gam: 0,
    teknik: 0,
    cocuk: 0,
    klasik: 0,
    halk: 0,
    populer: 0,
  } satisfies Record<ChartCategory, number>;
  const byDifficulty = {
    baslangic: 0,
    orta: 0,
    ileri: 0,
  } satisfies Record<ChartDifficulty, number>;
  let withBlackKeys = 0;
  for (const c of CHARTS) {
    byCategory[c.category]++;
    byDifficulty[c.difficulty]++;
    if (chartHasBlackKeys(c)) withBlackKeys++;
  }
  return { total: CHARTS.length, byCategory, byDifficulty, withBlackKeys };
}
