import type { Band } from "./bands";
import type { AttemptRecord, ErrorSpan } from "./attempt";
import { primaryError } from "./attempt";
import { getLesson } from "./curriculum";
import { gateMetricsForModule } from "./gate-metrics";

/** S35 — one correction at a time; short sentences + pause marks. */
export function feedbackBubblesForAttempt(attempt: AttemptRecord, band: Band): string[] {
  if (!attempt.valid) {
    return [invalidBubble(attempt.invalidReason, band)];
  }

  const err = primaryError(attempt.errorSpans);
  if (!err) {
    return [
      band === "adult"
        ? "Güzel kayıt. … Hedef net. [nefes] Kapıya bakabiliriz."
        : "Güzel deneme. … Bu tur temiz. [nefes] Kapıya bakabiliriz.",
    ];
  }

  return [praiseLine(band), correctionLine(err, band)];
}

function praiseLine(band: Band): string {
  if (band === "child") return "Güzel deneme. …";
  if (band === "teen") return "Oldu. …";
  return "Kayıt alındı. …";
}

function correctionLine(err: ErrorSpan, band: Band): string {
  const measure = `Ölçü ${err.measure}`;
  if (err.type === "pitch") {
    const detail =
      err.expected && err.heard
        ? `${err.expected} bekleniyordu, ${err.heard} geldi`
        : "perde kaymış";
    if (band === "child") {
      return `${measure}. [kısa durak] ${detail}. [nefes] Bir kez daha, yavaş.`;
    }
    if (band === "teen") {
      return `${measure}: perde. [kısa durak] ${detail}. [nefes] Önce o ölçüyü yalnız çalış.`;
    }
    return `${measure}: perde hatası. [kısa durak] ${detail}. [nefes] Yalnız o ölçüyü yavaş tempoda tekrarlayın.`;
  }

  // timing
  if (band === "child") {
    return `${measure}. [kısa durak] Biraz erken/geç. [nefes] Yavaş sayarak bir kez daha.`;
  }
  if (band === "teen") {
    return `${measure}: zamanlama. [kısa durak] Tempo öne kaymış. [nefes] O ölçüyü metronomsuz yavaşla.`;
  }
  return `${measure}: zamanlama. [kısa durak] Grid dışı giriş. [nefes] Aynı ölçüyü yavaş tempoda tekrarlayın.`;
}

export function invalidBubble(
  reason: AttemptRecord["invalidReason"],
  band: Band,
): string {
  switch (reason) {
    case "silence":
      return band === "adult"
        ? "Ses duyulmadı. … [kısa durak] Yeniden kaydedelim."
        : "Ses duyulmadı. … [kısa durak] Yeniden kaydedelim mi?";
    case "noise":
      return band === "adult"
        ? "Ortam çok gürültülü. … [kısa durak] Sessiz bir yerde tekrar dener misiniz?"
        : "Ortam çok gürültülü. … [kısa durak] Tekrar dener misin?";
    case "too_quiet":
      return band === "adult"
        ? "Ses biraz uzak veya düşük. … [kısa durak] Daha yakın oturun, tekrar deneyin."
        : "Ses biraz uzak. … [kısa durak] Daha yakın otur, tekrar dene.";
    case "too_short":
      return "Kayıt çok kısa. … [kısa durak] Biraz daha uzun çalalım.";
    case "denied_mic":
      return "Mikrofon izni yok. … [kısa durak] Dinleme bekliyor.";
    case "abandoned":
      return band === "adult"
        ? "Kayıt yarıda kaldı. … [kısa durak] Kota düşmedi. Hazır olunca yeniden başlayın."
        : "Kayıt yarıda kaldı. … [kısa durak] Kota düşmedi. Hazır olunca yeniden başlayalım.";
    default:
      return "Bu deneme geçerli değil. … [kısa durak] Yeniden deneyelim.";
  }
}

export function performanceIntroBubble(band: Band): string {
  if (band === "child") {
    return "Parçanı baştan sona çalacağız. … [kısa durak] Ben kayıtta susacağım.";
  }
  if (band === "teen") {
    return "Performans kaydı. … [kısa durak] Bitişte özet gelir — canlı hata listesi yok.";
  }
  return "Performans kaydı. … [kısa durak] Analiz bitişte; kayıt sırasında sessiz kalırım.";
}

export function midiIntroBubble(band: Band): string {
  if (band === "child") {
    return "USB / MIDI klavyeni bağla. … [kısa durak] Tuşlara basınca dinlerim — mikrofon yok.";
  }
  if (band === "teen") {
    return "MIDI klavye bağla. … [kısa durak] Nota sinyali gelir; mic gerekmez.";
  }
  return "USB veya MIDI klavyeyi bağlayın. … [kısa durak] Nota-on/off ile dinlerim; mikrofon gerekmez.";
}

export function midiUnsupportedBubble(band: Band): string {
  if (band === "child") {
    return "Bu tarayıcı MIDI desteklemiyor. … [kısa durak] Ortam veya performans kaydıyla devam edebilirsin.";
  }
  if (band === "teen") {
    return "Web MIDI yok bu tarayıcıda. … [kısa durak] Yöntem 1 veya 2’ye geç.";
  }
  return "Bu tarayıcı Web MIDI API desteklemiyor. … [kısa durak] Yöntem 1 veya 2 ile devam edebilirsiniz (Chrome / Edge önerilir).";
}

export function quotaExhaustedBubble(band: Band): string {
  if (band === "child") {
    return "Performans kotan doldu. … [kısa durak] Ortam kaydıyla devam edebilirsin.";
  }
  if (band === "teen") {
    return "Yöntem 2 kotası doldu. … [kısa durak] Ortam kaydına geçebilirsin — ders açık.";
  }
  return "Yöntem 2 kotası doldu. … [kısa durak] Ortam kaydına düşebilirsiniz; ders kilitli değil.";
}

export function gateFailBubble(band: Band, err: ErrorSpan | null): string {
  if (band === "child") {
    return err
      ? `Sorun değil. … Henüz kapıyı açmadık. [kısa durak] Ölçü ${err.measure}’ye tekrar bak. … Hazır olunca yine deneriz.`
      : "Sorun değil. … Henüz kapıyı açmadık. [kısa durak] Yavaş bir tur daha. … Hazır olunca deneriz.";
  }
  if (band === "teen") {
    return err
      ? `Geçmedi, sorun değil. … Ölçü ${err.measure}’yi yumuşatalım. [kısa durak] Acele yok.`
      : "Geçmedi, sorun değil. … Aynı parçayı bir tur daha — acele yok.";
  }
  return err
    ? `Eşik bu turda tutmadı. … Özellikle ölçü ${err.measure}. [kısa durak] Mikro tekrardan sonra yeniden kayıt öneririm.`
    : "Eşik bu turda tutmadı. … [kısa durak] Mikro tekrardan sonra yeniden deneyin.";
}

export function gatePassBubble(band: Band): string {
  if (band === "child") {
    return "Harika. … Kapı açıldı. [kısa durak] Bir sonraki derse geçebilirsin.";
  }
  if (band === "teen") {
    return "Geçtin. … Bu ders tamam. [kısa durak] Sonraki derse geçebilirsin.";
  }
  return "Tebrikler. … Kapı standardı sağlandı. [kısa durak] Sonraki derse geçebilirsiniz.";
}

/**
 * Gate from valid Attempt using per-module metric placeholders (Dilim G).
 * High-severity counts vs maxHigh* — stub until real pitch/align worker.
 */
export function evaluateGateFromAttempt(
  attempt: AttemptRecord,
): "pass" | "fail" | "invalid" {
  if (!attempt.valid) return "invalid";

  const lesson = getLesson(attempt.lessonId);
  const metrics = gateMetricsForModule(lesson?.moduleId ?? 1);

  const highPitch = attempt.errorSpans.filter(
    (s) => s.type === "pitch" && s.severity === "high",
  ).length;
  const highTiming = attempt.errorSpans.filter(
    (s) => s.type === "timing" && s.severity === "high",
  ).length;

  if (highPitch > metrics.maxHighPitchErrors) return "fail";
  if (highTiming > metrics.maxHighTimingErrors) return "fail";
  if (attempt.scoreSummary?.bandLabel === "fail" && highPitch + highTiming > 0) {
    return "fail";
  }
  return "pass";
}
