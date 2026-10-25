import type { LessonContent } from "./lesson-content-types";

/** Dilim G — practical rich shells (≥2 per M2–M4): entry + gate. */

export const M2_L1: LessonContent = {
  id: "piano.m2.l1",
  scoreRef: "score.piano.m2.l1.v0",
  goals: {
    child: "Sol anahtarını tanırsın; orta Do’yu çizgide görürsün.",
    teen: "Sol anahtarı ve porte çizgilerini okumaya başlarsın.",
    adult: "Sol anahtarı ve porte mantığını net terimlerle kurarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün sol anahtarına bakacağız. [kısa durak] Hazır mısın?",
      teen: "Selam. … Sol anahtarı ve porte. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Bugün sol anahtarı temelini kuruyoruz. [kısa durak] Hazır olduğunuzda devam.",
    },
  ],
  practiceSteps: [
    {
      child: "Sol anahtarını bul; orta Do’yu çizgide göster.",
      teen: "Orta Do’yu portede işaretle, çal.",
      adult: "Orta Do referansını portede ve tuşta eşleyin.",
    },
  ],
  practiceBubbles: [
    {
      child: "Güzel. … Yavaş bak. [kısa durak] Dinlemeye hazır mısın?",
      teen: "İyi. … Referansı kilitle. [kısa durak] Dinlemeye hazır mısın?",
      adult: "Tamam. … Eşleme net. [kısa durak] Dinlemeye geçebilirsiniz.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Sessiz ortam.",
    teen: "Kısa ortam kaydı. … Sessiz tut.",
    adult: "Kısa ortam kaydı. … Ortamı sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Sol anahtar yerinde. [nefes] Kapıya bakabiliriz.",
    teen: "Oldu. … Porte net. [kısa durak] Kapıya geçebiliriz.",
    adult: "Kayıt alındı. … Temel yerleşti. [kısa durak] Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Kapı açıldı. [kısa durak] Sonraki derse geçebilirsin.",
      teen: "Geçtin. … Sonraki derse.",
      adult: "Tebrikler. … Sonraki derse geçebilirsiniz.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Sol anahtara bir kez daha bak. [kısa durak] Yavaş.",
      teen: "Geçmedi, sorun değil. … Porte referansını tekrar et.",
      adult: "Eşik tutmadı. … Orta Do eşlemesini yeniden doğrulayın.",
    },
  ],
  failMicroTarget: {
    child: "Sol anahtarını göster, orta Do’yu çiz.",
    teen: "Orta Do’yu portede işaretle.",
    adult: "Orta Do’yu portede ve tuşta beş kez eşleyin.",
  },
};

export const M2_L6: LessonContent = {
  id: "piano.m2.l6",
  scoreRef: "score.piano.m2.gate.v0",
  goals: {
    child: "Notadan Do–Sol + karışık süreleri kısa parçada uygularsın.",
    teen: "Okuma + süreleri bir parçada birleştirirsin.",
    adult: "Okuma + süre standardını kapı parçasında gösterirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Kapı günü. … Kısa şarkını çalacağız. [kısa durak] Yavaş.",
      teen: "Modül 2 kapısı. … Parçayı kaydedeceğiz. [kısa durak] Acele yok.",
      adult:
        "Modül 2 performans kapısı. … Tam kayıt alacağız. [kısa durak] Hazır olduğunuzda.",
    },
  ],
  practiceSteps: [
    {
      child: "Kapı şarkını çal ve kaydet — yavaş.",
      teen: "Kapı parçasını kaydet; skoruna bak.",
      adult: "Tam kayıt; hata listesini çalışın.",
    },
  ],
  practiceBubbles: [
    {
      child: "Hazırsan kayda geçelim. … Ben susacağım.",
      teen: "Bitişte özet gelir. … Kayıtta susuyorum.",
      adult: "Kayıt sırasında sessiz kalırım. … Bitişte rapor.",
    },
  ],
  recommendedMethod: "2",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Kapı için kısa performans veya ortam. … Bakıcı mic OK.",
    teen: "Tercihen performans kaydı. … Ortam yedek.",
    adult: "Tercihen Yöntem 2. … Yöntem 1 yedek.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Kapıya bakabiliriz. [nefes]",
    teen: "Rapor hazır. … Kapıya geçebiliriz.",
    adult: "Rapor hazır. … Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Modül 2 bitti. [kısa durak] Sol el merhaba!",
      teen: "Geçtin. … M3’e geçebilirsin.",
      adult: "Tebrikler. … M3 sol el omurgası açıldı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Okuma veya süreyi yumuşatalım. [kısa durak]",
      teen: "Geçmedi. … M2 mikro-tekrar — acele yok.",
      adult: "Eşik tutmadı. … Okuma/süre mikro tekrarı öneririm.",
    },
  ],
  failMicroTarget: {
    child: "Do–Sol + kısa-uzun ritmi yavaş çal.",
    teen: "Kapı motifini yavaş iki tur.",
    adult: "Kapı parçasını bölümleyip yavaş birleştirin.",
  },
};

export const M3_L1: LessonContent = {
  id: "piano.m3.l1",
  scoreRef: "score.piano.m3.l1.v0",
  goals: {
    child: "Sol eli klavyeye güvenle koyarsın; sol parmak numaralarını tanırsın.",
    teen: "Sol el oturuşunu Do pozisyonuna bağlarsın.",
    adult: "Sol el yüksekliği ve bilek rahatlığını bilinçli kurarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün sol ele merhaba diyeceğiz. [kısa durak] Hazır mısın?",
      teen: "Selam. … Sol el pozisyonu. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Sol el ergonomisi. [kısa durak] Sağ el alışkanlığını kopyalamayın.",
    },
  ],
  practiceSteps: [
    {
      child: "Sol elini orta Do’nun altına koy; 10 saniye dur.",
      teen: "Sol eli yerleştir; 4 ölçü sessiz tutuş.",
      adult: "Pozisyonu ayarlayın; 1 dk kontrollü tutuş.",
    },
  ],
  practiceBubbles: [
    {
      child: "Çok güzel. … Omuz yumuşak. [kısa durak]",
      teen: "İyi. … Referans aynı orta Do. [kısa durak]",
      adult: "Tamam. … Bilek nötr kalsın. [kısa durak]",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Sessiz. Bakıcı yardım edebilir.",
    teen: "Kısa ortam kaydı.",
    adult: "Kısa ortam kaydı.",
  },
  mockFeedback: {
    child: "Güzel. … Sol el yerinde. [nefes]",
    teen: "Oldu. … Pozisyon tutarlı.",
    adult: "Kayıt alındı. … Ergonomi hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Sonraki derse geçebilirsin.",
      teen: "Geçtin. … Sonraki derse.",
      adult: "Tebrikler. … Sonraki derse geçebilirsiniz.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Sol eli bir kez daha koy. [kısa durak]",
      teen: "Geçmedi. … Tutuşu tekrar et — acele yok.",
      adult: "Eşik tutmadı. … Sol el yüksekliğini yeniden ayarlayın.",
    },
  ],
  failMicroTarget: {
    child: "Sol eli orta Do altına koy, 10 sn dur.",
    teen: "Sol eli yerleştir, 4 ölçü tut.",
    adult: "Sol el pozisyonunu 30 sn bilinçli tutun.",
  },
};

export const M3_L6: LessonContent = {
  id: "piano.m3.l6",
  scoreRef: "score.piano.m3.gate.v0",
  goals: {
    child: "Sol 5 parmak + kırık üçlü + sırayla elleri kısa parçada birleştirirsin.",
    teen: "Sol teknik + sırayla iki eli kapı parçasında gösterirsin.",
    adult: "Sol el + kırık üçlü + sırayla eller standardını kapıda gösterirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Modül 3 gösterisi. … Kapı şarkını çalacağız. [kısa durak] Yavaş.",
      teen: "M3 kapı parçası. … Kayda hazır mısın? [kısa durak]",
      adult: "M3 performans. … Tam kayıt. [kısa durak] Hazır olduğunuzda.",
    },
  ],
  practiceSteps: [
    {
      child: "Kapı şarkını baştan sona çal — acele yok.",
      teen: "Kapı parçasını kaydet; skoruna bak.",
      adult: "Tam kayıt; hata listesini çalışın.",
    },
  ],
  practiceBubbles: [
    {
      child: "Eller sırayla. … Ben kayıtta susacağım.",
      teen: "Bitişte özet. … Canlı hata yok.",
      adult: "Kayıt sırasında sessizim. … Bitişte rapor.",
    },
  ],
  recommendedMethod: "2",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Kısa performans veya ortam. … Bakıcı mic OK.",
    teen: "Yöntem 2 tercih / 1 yedek.",
    adult: "Yöntem 2 tercih; 1 yedek.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Kapıya bakabiliriz.",
    teen: "Rapor hazır. … Kapıya.",
    adult: "Rapor hazır. … Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … İki el birlikteye hazırız. [kısa durak]",
      teen: "Geçtin. … M4 açıldı.",
      adult: "Tebrikler. … M4 iki el omurgası açıldı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Sol yürüyüşü yumuşatalım. [kısa durak]",
      teen: "Geçmedi. … 3.2–3.5 mikro döngü.",
      adult: "Eşik tutmadı. … Sol el / kırık üçlü mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Sol 5 parmak + Do–Mi–Sol kırık, yavaş.",
    teen: "Sol 5 parmak ve kırık üçlüyü ayrı çalış.",
    adult: "Sol 5 parmak + kırık üçlüyü izole edip birleştirin.",
  },
};

export const M4_L1: LessonContent = {
  id: "piano.m4.l1",
  scoreRef: "score.piano.m4.l1.v0",
  goals: {
    child: "İki elle aynı anda yumuşakça basmayı öğrenirsin.",
    teen: "İki eli aynı vuruşta başlatmayı kontrol edersin.",
    adult: "İki el saldırı ve bırakmayı bilinçli hizalarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün iki el birlikte. [kısa durak] Çok yavaş.",
      teen: "Selam. … Eşzamanlı giriş. [kısa durak] Başlayalım mı?",
      adult: "Merhaba. … Eşzamanlı kontrol. [kısa durak] Tempo düşük tutun.",
    },
  ],
  practiceSteps: [
    {
      child: "İki el birlikte: Do — üç kez, yavaş.",
      teen: "Birlikte Do; sonra sağ Mi + sol Do — 4 kez.",
      adult: "Birlikte vuruş drili; 2 dk yavaş.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Aynı anda. [kısa durak] Acele yok.",
      teen: "İyi. … Attack’ı hizala. [kısa durak]",
      adult: "Tamam. … Attack ve release birlikte. [kısa durak]",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Sessiz.",
    teen: "Kısa ortam kaydı.",
    adult: "Kısa ortam kaydı.",
  },
  mockFeedback: {
    child: "Güzel. … Birlikte dokunuş net.",
    teen: "Oldu. … Eşzamanlı giriş tutarlı.",
    adult: "Kayıt alındı. … Hizalama hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Sonraki derse geçebilirsin.",
      teen: "Geçtin. … Sonraki derse.",
      adult: "Tebrikler. … Sonraki derse geçebilirsiniz.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Birlikte üç kez daha, yavaş.",
      teen: "Geçmedi. … Attack drili tekrar.",
      adult: "Eşik tutmadı. … Birlikte vuruş izolasyonu.",
    },
  ],
  failMicroTarget: {
    child: "İki el Do — üç kez yavaş.",
    teen: "Birlikte Do, 4 kez hizalı.",
    adult: "Birlikte attack/release 1 dakika yavaş.",
  },
};

export const M4_L6: LessonContent = {
  id: "piano.m4.l6",
  scoreRef: "score.piano.m4.gate.v0",
  goals: {
    child: "İki eli aynı tempoda kapı parçasında gösterirsin.",
    teen: "İki el + kısa düzenlemeyi kapıda birleştirirsin.",
    adult: "A1→A2 eşiğini iki el kapı parçasında gösterirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Modül 4 kapısı. … Kapı şarkını kaydedeceğiz. [kısa durak] Yavaş.",
      teen: "M4 kapı performansı. … Kayda hazır mısın?",
      adult: "M4 performans kapısı. … Tam kayıt. Checklist hazır.",
    },
  ],
  practiceSteps: [
    {
      child: "Kapı şarkını kaydet — çok yavaş tempo OK.",
      teen: "Kapı parçasını kaydet; skoruna bak.",
      adult: "Tam kayıt; checklist’i işaretleyin.",
    },
  ],
  practiceBubbles: [
    {
      child: "İki el birlikte. … Ben susacağım.",
      teen: "Bitişte rapor. … Canlı hata yok.",
      adult: "Kayıt sırasında sessizim. … Bitişte rapor.",
    },
  ],
  recommendedMethod: "2",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Kısa performans veya ortam. … Tempo düşük tutulabilir.",
    teen: "Yöntem 2 tercih / 1 yedek.",
    adult: "Yöntem 2 tercih; 1 yedek.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Kapıya bakabiliriz.",
    teen: "Rapor hazır. … Kapıya.",
    adult: "Rapor hazır. … Kapıya geçebilirsiniz.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … İki el kapısı açıldı. [kısa durak] Bravissimo!",
      teen: "Geçtin. … M4 tamam — omurga M5 sonra.",
      adult: "Tebrikler. … M4 eşiği sağlandı. M5 post-MVP.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Melodi + bası yumuşatalım. [kısa durak]",
      teen: "Geçmedi. … 4.3–4.4 uzat — acele yok.",
      adult: "Eşik tutmadı. … Tempo birliği mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Melodi + tek bas, çok yavaş birleştir.",
    teen: "Kırık bas + ezgiyi yavaş iki tur.",
    adult: "Eller ayrı sonra yavaş birleşik tur.",
  },
};

export const M2M4_CONTENT: Record<string, LessonContent> = {
  [M2_L1.id]: M2_L1,
  [M2_L6.id]: M2_L6,
  [M3_L1.id]: M3_L1,
  [M3_L6.id]: M3_L6,
  [M4_L1.id]: M4_L1,
  [M4_L6.id]: M4_L6,
};
