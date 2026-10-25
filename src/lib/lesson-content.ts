import type { Band } from "./bands";
import { getLesson, lessonTitle } from "./curriculum";
import { gateMetricsForModule } from "./gate-metrics";
import { M2M4_CONTENT } from "./lesson-content-m2m4";
import type { LessonContent } from "./lesson-content-types";

export type {
  BandedText,
  LessonContent,
  ListeningMethod,
  PracticeVisual,
} from "./lesson-content-types";
export { isListeningRequired, practiceVisualOf } from "./lesson-content-types";

const M1_L1: LessonContent = {
  id: "piano.m1.l1",
  scoreRef: "score.piano.m1.l1.v0",
  listeningRequired: false,
  practiceVisual: "posture-hands",
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
  theorySteps: [
    {
      child: "Sandalyeyi piyanoya yaklaştır — dirseğin rahat açılsın.",
      teen: "Sandalyeyi ayarla: dirsek doğal açı, ayaklar yerde.",
      adult: "Sandalyeyi ayarlayın: ayaklar yerde, dirsek doğal açı.",
    },
    {
      child: "Omuzlarını düşür; bileğini düz tut.",
      teen: "Omuzları bırak; bileği nötr tut.",
      adult: "Omuzları bilinçli bırakın; bileği nötr hizada tutun.",
    },
    {
      child: "Parmaklarını yumuşak kıvrımla tuşların üstüne koy — henüz basma.",
      teen: "Parmakları yumuşak kemerle tuşlara koy; baskı yok.",
      adult: "Parmakları yumuşak kemerle tuşlara yerleştirin; henüz ses yok.",
    },
  ],
  practiceSteps: [
    {
      child: "1) Otur: ayaklar yerde, sırt dik ama sert değil.",
      teen: "1) Oturuş: ayaklar yerde, omurga uzun, omuzlar düşük.",
      adult: "1) Oturuşu sabitleyin: ayaklar yerde, omuzlar düşük, mesafe dirsek rahat.",
    },
    {
      child: "2) Ellerini tuşların üstüne koy; 10 saniye hiç basmadan dur.",
      teen: "2) Elleri tuşlara koy; 4 ölçü boyunca basmadan tut.",
      adult: "2) Elleri tuşlara koyun; ~30–60 sn sessiz tutuş (basmadan).",
    },
    {
      child: "3) Omuzunu yukarı çekip bırak — yumuşak olsun. Tekrar et.",
      teen: "3) Omuzları bilerek kaldır-bırak; iki nefes tut. Kontrol et.",
      adult:
        "3) Omuzları bilinçli kaldırıp bırakın; iki nefes boyunca bilek nötr kalsın.",
    },
    {
      child: "4) Aynaya veya bakıcıya sor: omuz düşük mü, bilek düz mü?",
      teen: "4) Kısa kontrol: omuz düşük, bilek düz, mesafe rahat mı?",
      adult: "4) Öz kontrol: omuz, bilek, mesafe — üçü de rahat mı?",
    },
  ],
  practiceBubbles: [
    {
      child: "Çok güzel. … Yavaş ve sakin. [kısa durak] Eller yerinde mi?",
      teen: "İyi. … Tempo yok; sadece pozisyon. [kısa durak] Hazır olunca onayla.",
      adult:
        "Tamam. … Tempo yok; yalnızca duruş. [kısa durak] Hazır olduğunuzda öz onaya geçin — mikrofon gerekmez.",
    },
  ],
  selfCheckPrompt: {
    child: "Omuzların düşük ve ellerin tuşların üstünde mi? Evet dersen kapı açılır.",
    teen: "Oturuş + el pozisyonu oturdu mu? Onaylarsan bu dersi geçersin (kayıt yok).",
    adult:
      "Oturuş ve el pozisyonunu bilinçli kurdunuz mu? Onaylarsanız kapı açılır — dinleme kaydı gerekmez.",
  },
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
  listeningRequired: true,
  practiceVisual: "none",
  theorySteps: [
    {
      child: "İki siyahlı grubu bul.",
      teen: "İki siyahlı grubu bul; sağına bak.",
      adult: "İki siyahlı grubu bulun; sağındaki beyaz tuş orta Do’dur.",
    },
    {
      child: "Yanındaki beyaz tuşa parmağınla dokun — o orta Do.",
      teen: "Sağındaki beyaz tuşa dokun; adını söyle: orta Do.",
      adult: "Sağındaki beyaz tuşa dokunun; referansı beş kez tekrarlayın.",
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
