import type { Band } from "./bands";
import { getLesson, lessonTitle } from "./curriculum";
import { gateMetricsForModule } from "./gate-metrics";
import { M2M4_CONTENT } from "./lesson-content-m2m4";
import type { LessonContent } from "./lesson-content-types";

export type { BandedText, LessonContent, ListeningMethod } from "./lesson-content-types";

const M1_L1: LessonContent = {
  id: "piano.m1.l1",
  scoreRef: "score.piano.m1.l1.v0",
  goals: {
    child: "Piyanoya oturuşu ve el pozisyonunu güvenli öğrenirsin.",
    teen: "Doğru oturuş ve el yüksekliğini kurarsın.",
    adult: "Oturuş, mesafe ve el pozisyonunu bilinçli kurarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün sandalyede rahat oturacağız. [kısa durak] Hazır mısın?",
      teen: "Selam. … Bu derste oturuş ve eli netleştireceğiz. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Bugünkü hedef: ergonomik oturuş. [kısa durak] Hazır olduğunuzda devam edelim.",
    },
    {
      child: "Omuzlar düşük. … Bilek rahat. [kısa durak] Ayaklar yere değsin.",
      teen: "Omuzları bırak. … Bilek nötr. [kısa durak] Mesafe: dirsek rahat açılsın.",
      adult:
        "Omuzlar düşük, bilek nötr. … Mesafe: dirsek doğal açı. [kısa durak] Bir dakika sessiz tutuş yeter.",
    },
  ],
  practiceSteps: [
    {
      child: "Ellerini tuşların üstüne koy; 10 saniye dur.",
      teen: "Pozisyonu ayarla; 4 ölçü boyunca tut.",
      adult: "Ayarları sabitleyin; 1 dakika sessiz tutuş.",
    },
    {
      child: "Omuzunu yukarı çekip bırak — yumuşak olsun.",
      teen: "Omuzları bilerek bırak; iki nefes tut.",
      adult: "Omuzları bilinçli bırakın; iki nefes boyunca kontrol edin.",
    },
  ],
  practiceBubbles: [
    {
      child: "Çok güzel. … Yavaş ve sakin. [kısa durak] Eller yerinde mi?",
      teen: "İyi. … Tempo yok; sadece pozisyon. [kısa durak] Devam.",
      adult:
        "Tamam. … Tempo yok; yalnızca duruş. [kısa durak] Hazır olduğunuzda dinlemeye geçelim.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Ortam sessiz olsun. [kısa durak] Bakıcı mic’e yardım edebilir.",
    teen: "Yakın otur. … Ortamı mümkün olduğunca sessiz tut.",
    adult: "Klavyeye yakın oturun. … Ortamı mümkün olduğunca sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Oturuşun net görünüyor. [nefes] Kapıya bakabiliriz.",
    teen: "Oldu. … Pozisyon tutarlı. [kısa durak] Kapıya geçebiliriz.",
    adult: "Kayıt alındı. … Oturuş hedefi sağlandı. [kısa durak] Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Kapı açıldı. [kısa durak] Bir sonraki derse geçebilirsin.",
      teen: "Geçtin. … Bu ders tamam. [kısa durak] Sonraki derse geçebilirsin.",
      adult:
        "Tebrikler. … Kapı standardı sağlandı. [kısa durak] Sonraki derse geçebilirsiniz.",
    },
  ],
  gateFailBubbles: [
    {
      child:
        "Sorun değil. … Henüz kapıyı açmadık. [kısa durak] Omuzları bir kez daha yumuşatalım.",
      teen: "Geçmedi, sorun değil. … Omuzlar biraz yüksek kalmış. [kısa durak] Bir tur daha — acele yok.",
      adult:
        "Eşik bu turda tutmadı. … Özellikle omuz ve bilek. [kısa durak] Mikro tekrardan sonra yeniden deneyin.",
    },
  ],
  failMicroTarget: {
    child: "Omuzları bırak, 10 saniye dur.",
    teen: "Omuzları bırakıp 4 ölçü tut.",
    adult: "Omuz ve bileği nötr tutarak 30 saniye sabitleyin.",
  },
};

const M1_L2: LessonContent = {
  id: "piano.m1.l2",
  scoreRef: "score.piano.m1.l2.v0",
  goals: {
    child: "Orta Do’yu klavyede bulup parmağınla gösterirsin.",
    teen: "Orta Do’yu ve çevresindeki referans tuşları bulursun.",
    adult: "Orta Do’yu kalıcı referans olarak klavyede yerleştirirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün orta Do’yu bulacağız. [kısa durak] Hazır mısın?",
      teen: "Selam. … Bu derste orta Do haritasını netleştireceğiz. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Bugünkü hedef: orta Do referansını kalıcı yerleştirmek. [kısa durak] Hazır olduğunuzda devam edelim.",
    },
    {
      child:
        "İki siyahlı grubun yanına bak. … Orası orta Do. [kısa durak] Parmağınla göster.",
      teen: "İki siyahlı grubun sağındaki beyaz tuş. … O orta Do. [kısa durak] Bir oktav üstü de aynı mantık.",
      adult:
        "İki siyahlı grubun sağındaki beyaz tuş orta Do’dur. … Bu referansı ezberleyin. [kısa durak] Gözler kapalı denemeden önce beş kez bulun.",
    },
  ],
  practiceSteps: [
    {
      child: "Orta Do’ya üç kez dokun.",
      teen: "Orta Do → bir oktav üst Do (parmakla göster).",
      adult: "Gözler kapalı denemeden önce 5 kez bulun.",
    },
    {
      child: "Ellerini kaldır, yine bul — yavaş.",
      teen: "Elleri kaldırıp yeniden bul; tempo yok.",
      adult: "Elleri kaldırıp yeniden bulun; acele etmeyin.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Yavaş bul. [kısa durak] Acele yok.",
      teen: "İyi. … Referansı kilitle. [kısa durak] Dinlemeye hazır mısın?",
      adult:
        "Tamam. … Referans yerleşiyor. [kısa durak] Dinlemeye hazır olduğunuzda devam.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child:
      "Orta Do’ya dokunurken kaydedeceğiz. … Sessiz ortam. [kısa durak] Bakıcı yardım edebilir.",
    teen: "Orta Do buluşunu kısa kaydet. … Ortam sessiz olsun.",
    adult: "Orta Do buluşunu kısa kaydedin. … Ortamı sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Orta Do doğru yerde. [nefes] Kapıya bakabiliriz.",
    teen: "Oldu. … Referans net. [kısa durak] Kapıya geçebiliriz.",
    adult: "Kayıt alındı. … Orta Do hedefi sağlandı. [kısa durak] Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Kapı açıldı. [kısa durak] Sonraki derse geçebilirsin.",
      teen: "Geçtin. … Harita adımı tamam. [kısa durak] Sonraki derse.",
      adult: "Tebrikler. … Referans yerleşti. [kısa durak] Sonraki derse geçebilirsiniz.",
    },
  ],
  gateFailBubbles: [
    {
      child:
        "Sorun değil. … Henüz kapıyı açmadık. [kısa durak] İki siyahlı grubun yanına tekrar bak.",
      teen: "Geçmedi, sorun değil. … Orta Do bir tuş kaymış olabilir. [kısa durak] Bir tur daha.",
      adult:
        "Eşik bu turda tutmadı. … Orta Do konumunu yeniden doğrulayın. [kısa durak] Sonra yeniden kayıt.",
    },
  ],
  failMicroTarget: {
    child: "İki siyahlı grubu bul, yanında orta Do’yu göster.",
    teen: "İki siyahlı grubun sağındaki beyaz tuşu bul.",
    adult: "İki siyahlı grubun sağındaki beyaz tuşu beş kez doğrulayın.",
  },
};

const CONTENT: Record<string, LessonContent> = {
  [M1_L1.id]: M1_L1,
  [M1_L2.id]: M1_L2,
  ...M2M4_CONTENT,
};

/** Load band-aware shell; rich M1–M4 subset + generic overlay for remaining spine. */
export function loadLessonContent(lessonId: string): LessonContent | null {
  if (CONTENT[lessonId]) return CONTENT[lessonId];

  const def = getLesson(lessonId);
  if (!def) return null;

  const title = (band: Band) => lessonTitle(def, band);

  const metrics = gateMetricsForModule(def.moduleId);
  return {
    id: lessonId,
    scoreRef: def.scoreRef,
    goals: {
      child: `${title("child")} — M${def.moduleId} omurgası. ${metrics.labelTr}.`,
      teen: `${title("teen")} hedefini netleştirirsin.`,
      adult: `${title("adult")} hedefini bilinçli uygularsınız.`,
    },
    theoryBubbles: [
      {
        child: `Merhaba. … Bugün ${title("child")}. [kısa durak] Hazır mısın?`,
        teen: `Selam. … Bu derste ${title("teen")}. [kısa durak] Başlayalım mı?`,
        adult: `Merhaba. … Bugünkü hedef: ${title("adult")}. [kısa durak] Hazır olduğunuzda devam edelim.`,
      },
    ],
    practiceSteps: [
      {
        child: "Adımı yavaş yap. … Tempo yok.",
        teen: "Adımı yavaş uygula. … Tempo yok.",
        adult: "Adımı yavaş uygulayın. … Tempo yok.",
      },
    ],
    practiceBubbles: [
      {
        child: "Güzel. … Yavaş devam. [kısa durak] Dinlemeye hazır mısın?",
        teen: "İyi. … Yavaş tut. [kısa durak] Dinlemeye hazır mısın?",
        adult: "Tamam. … Yavaş tutun. [kısa durak] Dinlemeye hazır olduğunuzda devam.",
      },
    ],
    recommendedMethod: def.order >= 6 ? "2" : "1",
    allowedMethods: def.order >= 6 ? ["1", "2"] : ["1", "2"],
    listeningPrep: {
      child: "Yakın otur. … Sessiz ortam. [kısa durak] Bakıcı yardım edebilir.",
      teen: "Yakın otur. … Ortamı sessiz tut.",
      adult: "Yakın oturun. … Ortamı sessiz tutun.",
    },
    mockFeedback: {
      child: "Güzel deneme. … Bu tur yeterli. [nefes] Kapıya bakabiliriz.",
      teen: "Oldu. … Özet hazır. [kısa durak] Kapıya geçebiliriz.",
      adult: "Kayıt alındı. … Özet hazır. [kısa durak] Kapıya geçebilirsiniz.",
    },
    gatePassBubbles: [
      {
        child: "Harika. … Kapı açıldı. [kısa durak] Sonraki derse geçebilirsin.",
        teen: "Geçtin. … Sonraki derse geçebilirsin.",
        adult: "Tebrikler. … Sonraki derse geçebilirsiniz.",
      },
    ],
    gateFailBubbles: [
      {
        child: "Sorun değil. … Bir kez daha, yavaş. [kısa durak] Hazır olunca deneriz.",
        teen: "Geçmedi, sorun değil. … Bir tur daha — acele yok.",
        adult: "Eşik bu turda tutmadı. … Mikro tekrardan sonra yeniden deneyin.",
      },
    ],
    failMicroTarget: {
      child: "Aynı adımı yavaş tekrar et.",
      teen: "Aynı adımı yavaş tekrar et.",
      adult: "Aynı adımı yavaş tempoda tekrarlayın.",
    },
  };
}

export function pickBand<T>(map: Record<Band, T>, band: Band): T {
  return map[band];
}
