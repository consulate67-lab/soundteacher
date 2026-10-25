import type { LessonContent } from "./lesson-content-types";

/** M2–M4 rich shells. M2 follows Caner #2–5 topic order (theory → note pairs). */

export const M2_L1: LessonContent = {
  id: "piano.m2.l1",
  scoreRef: "score.piano.m2.l1.v0",
  listeningRequired: false,
  goals: {
    child: "Sol anahtarını tanırsın; porte çizgilerini görürsün.",
    teen: "Sol anahtarı, porte ve parmak numarası mantığını kurarsın.",
    adult: "Sol anahtarı, porte, anahtar rolleri ve parmak numaralarını netleştirirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün sol anahtarına bakacağız. [kısa durak] Hazır mısın?",
      teen: "Selam. … Teori: sol anahtarı ve porte. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Müzik alfabesi ve porte temeli. [kısa durak] Hazır olduğunuzda devam.",
    },
    {
      child: "Beş çizgi = porte. … Sol anahtarı başta durur. [kısa durak]",
      teen: "Sağ el çoğu zaman ince / sol anahtarı; sol el kalın tarafta.",
      adult:
        "Dizek, anahtarlar, sağ–sol el rolleri. … Parmak numaraları 1–5 sabittir.",
    },
  ],
  theorySteps: [
    {
      demo: "m2-l1-do-link",
      child: "Sol anahtarını bul; beş çizgiyi say.",
      teen: "Sol anahtarını işaretle; orta Do’nun geleceği yeri gör.",
      adult: "Sol anahtarı + porte çizgilerini tarif edin; parmak 1–5’i tekrarlayın.",
    },
  ],
  practiceSteps: [
    {
      demo: "m2-l1-do-link",
      child: "Sol anahtarını bul; orta Do’nun çizgisini bakıcıyla göster.",
      teen: "Porte üzerinde sol anahtarı + ‘Do buraya gelecek’ noktasını işaretle.",
      adult: "Sol anahtarı, porte ve parmak numaralarını checklist ile doğrulayın.",
    },
    {
      demo: "m2-l1-fingers",
      child: "Parmaklarını say: 1 2 3 4 5 — tuşa basmadan.",
      teen: "1–5 numaralarını sağ elde sessiz göster.",
      adult: "1–5 numaralarını her iki elde sessiz gösterin.",
    },
  ],
  practiceBubbles: [
    {
      child: "Güzel. … Porte dostun oldu. [kısa durak] Onayla, kayıt yok.",
      teen: "İyi. … Teori iskeleti hazır. [kısa durak] Öz onay.",
      adult: "Tamam. … Temel yerleşti. [kısa durak] Dinleme bu derste gerekmez.",
    },
  ],
  selfCheckPrompt: {
    child: "Sol anahtarını ve beş çizgiyi gösterebiliyor musun?",
    teen: "Sol anahtarı + porte + 1–5 net mi? Onayla (kayıt yok).",
    adult: "Sol anahtarı, porte ve parmak numaraları oturdu mu? Onay = kapı.",
  },
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Sessiz ortam.",
    teen: "Kısa ortam kaydı. … Sessiz tut.",
    adult: "Kısa ortam kaydı. … Ortamı sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Sol anahtar yerinde.",
    teen: "Oldu. … Porte net.",
    adult: "Hedef sağlandı. … Teori iskeleti yerleşti.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Şimdi orta Do notada. [kısa durak]",
      teen: "Geçtin. … Orta Do + süreler.",
      adult: "Tebrikler. … Sonraki: orta Do okuma ve süreler.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Sol anahtara bir kez daha bak. [kısa durak]",
      teen: "Geçmedi. … Porte + 1–5’i tekrar et.",
      adult: "Eşik tutmadı. … Anahtar ve porte mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Sol anahtarını göster, çizgileri say.",
    teen: "Sol anahtarı + 1–5 numaralarını göster.",
    adult: "Sol anahtarı, porte ve 1–5’i checklist ile doğrulayın.",
  },
};

export const M2_L2: LessonContent = {
  id: "piano.m2.l2",
  scoreRef: "score.piano.m2.l2.v0",
  listeningRequired: true,
  goals: {
    child: "Orta Do’yu notada görüp tuşta çalar; kısa ve uzun sesi ayırt edersin.",
    teen: "Orta Do’yu porte↔tuş eşlersin; dörtlük / ikilik hissini kurarsın.",
    adult: "Orta Do okumasını süre değerleriyle (dörtlük–ikilik) birleştirirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Orta Do notada da var. [kısa durak] Tuşta da.",
      teen: "Selam. … Orta Do + kısa/uzun ses. [kısa durak]",
      adult:
        "Merhaba. … Orta Do referansı portede; dörtlük kısa, ikilik uzun. [kısa durak]",
    },
  ],
  theorySteps: [
    {
      demo: "m2-l2-middle-c",
      child: "Notadaki Do’yu göster; tuştaki orta Do’ya dokun.",
      teen: "Porte Do ↔ tuş Do eşle.",
      adult: "Portedeki orta Do’yu tuşta beş kez eşleyin.",
    },
    {
      demo: "m2-l2-duration",
      child: "Kısa Do, uzun Do — dinle, sonra çal.",
      teen: "Dörtlük Do ×2 + ikilik Do.",
      adult: "Dörtlük ve ikilik Do’yu 4/4 içinde sayarak çalın.",
    },
  ],
  practiceSteps: [
    {
      demo: "m2-l2-duration",
      child: "Orta Do’yu üç kez kısa, bir kez uzun çal.",
      teen: "Ölçü: dörtlük×2 + ikilik Do — iki tur.",
      adult: "Yazılı ritim: dörtlük / ikilik karışımı; yavaş sayarak.",
    },
    {
      demo: "m2-l2-drm",
      child: "Do Re Mi — hepsi kısa; sonra Do uzun.",
      teen: "Do–Re–Mi dörtlük; Do ikilik kapanış.",
      adult: "Do–Re–Mi çizgisi + ikilik kapanış; iki birleşik tur.",
    },
  ],
  practiceBubbles: [
    {
      child: "Güzel. … Kısa ve uzun. [kısa durak] Dinlemeye hazır mısın?",
      teen: "İyi. … Eşleme + süre. [kısa durak] MIDI veya mic.",
      adult: "Tamam. … Dinlemeye hazır olduğunuzda devam.",
    },
  ],
  recommendedMethod: "3",
  allowedMethods: ["3", "1", "2"],
  listeningPrep: {
    child: "MIDI bağla veya mic ile Do’yu kaydet. … Sessiz.",
    teen: "USB/MIDI önerilir. … Y1/Y2 yedek.",
    adult: "MIDI önerilir. … Ortam/performans yedek.",
  },
  mockFeedback: {
    child: "Güzel. … Orta Do + süre net.",
    teen: "Oldu. … Okuma ve süre tutarlı.",
    adult: "Kayıt alındı. … Orta Do + süre hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Sırada Re ve Si. [kısa durak]",
      teen: "Geçtin. … Re / Si’ye geç.",
      adult: "Tebrikler. … Sonraki: Re ve Si.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Orta Do kısa-uzun bir kez daha. [kısa durak]",
      teen: "Geçmedi. … Do eşlemesi + dörtlük/ikilik izolasyonu.",
      adult: "Eşik tutmadı. … Orta Do + süre mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Orta Do kısa kısa uzun.",
    teen: "Dörtlük×2 + ikilik Do, iki tur.",
    adult: "Dörtlük/ikilik Do’yu sayarak bir dakika.",
  },
};

export const M2_L3: LessonContent = {
  id: "piano.m2.l3",
  scoreRef: "score.piano.m2.l3.v0",
  listeningRequired: true,
  goals: {
    child: "Re ve Si notalarını tuşta bulup kısa ezgide çalarsın.",
    teen: "Re / Si’yi porteden tuşa aktarıp Do çevresinde çalarsın.",
    adult: "Re ve Si okuma–çalma çiftini Do pozisyonu çevresinde uygularsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Re, Do’nun hemen üstü. … Si, Do’nun altı. [kısa durak]",
      teen: "Selam. … Re / Si çifti. [kısa durak] Do referansın dursun.",
      adult:
        "Merhaba. … Re (2’li grubun ortası) ve Si (Do’nun altı). [kısa durak]",
    },
  ],
  theorySteps: [
    {
      demo: "m2-l3-re",
      child: "Do’yu bul; bir üst beyaz = Re.",
      teen: "Do → Re; Do → Si (aşağı).",
      adult: "Do referansından Re ve Si’yi türetin; portede konumlarını tarif edin.",
    },
  ],
  practiceSteps: [
    {
      demo: "m2-l3-re",
      child: "Do Re Do — üç kez. Sonra Do Si Do.",
      teen: "Re–Do–Si–Do kısa motif; iki tur.",
      adult: "Re/Si flash + kısa motif; yavaş birleştirin.",
    },
    {
      demo: "m2-l3-si",
      child: "Re’ye ve Si’ye tek tek dokun; adını söyle.",
      teen: "Karışık Re/Si kartlarını çal.",
      adult: "Rastgele Re/Si; %80 doğruluk, acele yok.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Re ve Si dostun. [kısa durak] Dinlemeye?",
      teen: "İyi. … Çift oturuyor. [kısa durak] Kayda.",
      adult: "Tamam. … Dinlemeye hazır olduğunuzda.",
    },
  ],
  recommendedMethod: "3",
  allowedMethods: ["3", "1", "2"],
  listeningPrep: {
    child: "Re ve Si’yi çalarken kaydedeceğiz.",
    teen: "MIDI önerilir; mic yedek.",
    adult: "MIDI veya kısa performans kaydı.",
  },
  mockFeedback: {
    child: "Güzel. … Re ve Si yerinde.",
    teen: "Oldu. … Çift tutarlı.",
    adult: "Kayıt alındı. … Re/Si hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Sırada Mi ve La. [kısa durak]",
      teen: "Geçtin. … Mi / La.",
      adult: "Tebrikler. … Sonraki: Mi ve La.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Do’dan Re’ye bir adım. [kısa durak]",
      teen: "Geçmedi. … Re/Si izolasyonu.",
      adult: "Eşik tutmadı. … Re ve Si mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Do Re Do, sonra Do Si Do.",
    teen: "Re–Do–Si–Do yavaş iki tur.",
    adult: "Re/Si çiftini izole edip motifte birleştirin.",
  },
};

export const M2_L4: LessonContent = {
  id: "piano.m2.l4",
  scoreRef: "score.piano.m2.l4.v0",
  listeningRequired: true,
  goals: {
    child: "Mi ve La’yı bulur; 1 ve 3. parmakla yumuşak basarsın.",
    teen: "Mi / La okur; 1–3 parmak vurgusuyla çalarsın.",
    adult: "Mi ve La’yı 1. ve 3. parmak kontrolüyle okuyup çalarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Mi, Re’nin üstü. … La biraz daha yukarı. [kısa durak]",
      teen: "Selam. … Mi / La + parmak 1 ve 3. [kısa durak]",
      adult:
        "Merhaba. … Mi–La çifti; özellikle 1 ve 3. parmak rahatlığı. [kısa durak]",
    },
  ],
  theorySteps: [
    {
      demo: "m2-l4-mi",
      child: "Do Re Mi say; Mi’de dur.",
      teen: "Do pozisyonunda 3 = Mi; La’yı üstte bul.",
      adult: "Mi ve La konumlarını Do referansından türetin.",
    },
  ],
  practiceSteps: [
    {
      demo: "m2-l4-mi",
      child: "Do Mi Do — 1 ve 3. parmak. Üç kez.",
      teen: "1–3 Mi vurgusu; sonra La ekle.",
      adult: "1–3 drili + Mi/La kısa ezgi; eşit attack.",
    },
    {
      demo: "m2-l4-la",
      child: "Mi La Mi — yavaş.",
      teen: "Mi–La–Mi–Do motif; iki tur.",
      adult: "Mi/La flash + motif birleşik tur.",
    },
  ],
  practiceBubbles: [
    {
      child: "Güzel. … 1 ve 3 yumuşak. [kısa durak] Dinlemeye?",
      teen: "İyi. … Mi/La oturuyor. [kısa durak]",
      adult: "Tamam. … Dinlemeye geçebilirsiniz.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2", "3"],
  listeningPrep: {
    child: "Mi ve La’yı çalarken kaydet. … Sessiz.",
    teen: "Kısa ortam veya MIDI.",
    adult: "Kısa kayıt; MIDI opsiyonel.",
  },
  mockFeedback: {
    child: "Güzel. … Mi ve La net.",
    teen: "Oldu. … 1–3 tutarlı.",
    adult: "Kayıt alındı. … Mi/La hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Fa ve Sol kaldı. [kısa durak]",
      teen: "Geçtin. … Fa / Sol + tekrar.",
      adult: "Tebrikler. … Sonraki: Fa ve Sol.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Do Mi Do’yu yavaş dene. [kısa durak]",
      teen: "Geçmedi. … 1–3 + Mi izolasyonu.",
      adult: "Eşik tutmadı. … Mi/La mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Do Mi Do, üç kez yavaş.",
    teen: "1–3 Mi drili, iki tur.",
    adult: "Mi/La çiftini 1 dakika yavaş.",
  },
};

export const M2_L5: LessonContent = {
  id: "piano.m2.l5",
  scoreRef: "score.piano.m2.l5.v0",
  listeningRequired: true,
  goals: {
    child: "Fa ve Sol’u çalar; aynı parçayı bir kez daha tekrarlarsın.",
    teen: "Fa / Sol okur; basit röpriz (tekrar) fikrini uygularsın.",
    adult: "Fa ve Sol’u tamamlar; röpriz işaretinin pratik karşılığını uygularsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Fa ve Sol ile Do ailesi tamam. [kısa durak]",
      teen: "Selam. … Fa / Sol + ‘başa dön’ tekrarı. [kısa durak]",
      adult:
        "Merhaba. … Fa–Sol ile beşli tamam; röpriz = işaretlenen bölümü tekrarla. [kısa durak]",
    },
  ],
  theorySteps: [
    {
      demo: "m2-l5-fa-sol",
      child: "Do’dan Sol’a çık: Do Re Mi Fa Sol.",
      teen: "4=Fa, 5=Sol; çıkış-iniş.",
      adult: "Fa ve Sol’u portede ve tuşta eşleyin; röpriz fikrini söyleyin.",
    },
  ],
  practiceSteps: [
    {
      demo: "m2-l5-do-sol",
      child: "Do’dan Sol’a çık, Sol’dan Do’ya in — iki kez (ikinci = tekrar).",
      teen: "Fa–Sol vurgulu motif; sonra tüm Do–Sol; röpriz bir tur.",
      adult: "Do–Sol çizgisi + röpriz turu; tempo sabit tutun.",
    },
    {
      demo: "m2-l5-fa-sol",
      child: "Fa Sol Fa Sol — sonra Do.",
      teen: "Kısa Fa/Sol etüt + tekrar işareti hayali.",
      adult: "Fa/Sol flash; ardından işaretli tekrarla birleşik parça.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Tekrar ettin — aferin. [kısa durak] Dinlemeye?",
      teen: "İyi. … Fa/Sol + röpriz. [kısa durak]",
      adult: "Tamam. … Dinlemeye hazır olduğunuzda.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2", "3"],
  listeningPrep: {
    child: "Do–Sol yürüyüşünü kaydet. … Sessiz.",
    teen: "Kısa performans veya ortam.",
    adult: "Kısa kayıt; Yöntem 2 tercih edilebilir.",
  },
  mockFeedback: {
    child: "Güzel. … Fa ve Sol yerinde.",
    teen: "Oldu. … Beşli + tekrar tutarlı.",
    adult: "Kayıt alındı. … Fa/Sol + röpriz hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Modül 2 kapısına hazırsın. [kısa durak]",
      teen: "Geçtin. … Kapı parçasına.",
      adult: "Tebrikler. … Sonraki: Modül 2 kapısı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Do’dan Sol’a yavaş çık. [kısa durak]",
      teen: "Geçmedi. … Fa/Sol + Do–Sol izolasyonu.",
      adult: "Eşik tutmadı. … Fa/Sol mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Do Re Mi Fa Sol, yavaş bir tur.",
    teen: "Do–Sol çıkış-iniş, iki tur.",
    adult: "Do–Sol + bir röpriz turu yavaş.",
  },
};

export const M2_L6: LessonContent = {
  id: "piano.m2.l6",
  scoreRef: "score.piano.m2.gate.v0",
  listeningRequired: true,
  goals: {
    child: "Notadan Do–Sol + kısa-uzun süreleri kısa parçada uygularsın.",
    teen: "Okuma + süre + Re…Sol çiftlerini kapıda birleştirirsin.",
    adult: "Okuma + süre + nota çifti standardını kapı parçasında gösterirsiniz.",
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
      demo: "m2-l6-gate",
      child: "Kapı şarkını çal ve kaydet — Do’dan Sol’a, kısa ve uzun seslerle.",
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
  allowedMethods: ["1", "2", "3"],
  listeningPrep: {
    child: "Kapı için kısa performans veya ortam. … Bakıcı mic OK.",
    teen: "Tercihen performans kaydı. … Ortam yedek.",
    adult: "Tercihen Yöntem 2. … MIDI varsa 3; Yöntem 1 yedek.",
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
  [M2_L2.id]: M2_L2,
  [M2_L3.id]: M2_L3,
  [M2_L4.id]: M2_L4,
  [M2_L5.id]: M2_L5,
  [M2_L6.id]: M2_L6,
  [M3_L1.id]: M3_L1,
  [M3_L6.id]: M3_L6,
  [M4_L1.id]: M4_L1,
  [M4_L6.id]: M4_L6,
};
