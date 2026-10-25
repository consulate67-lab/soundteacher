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

/** M1.1 — oturuş (SoundTeacher own; not from Caner #1). */
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

/** M1.2 — tuşlar / siyah gruplar (Caner #1 geography). */
const M1_L2: LessonContent = {
  id: "piano.m1.l2",
  scoreRef: "score.piano.m1.l2.v0",
  listeningRequired: false,
  practiceVisual: "none",
  goals: {
    child: "İki ve üç siyahlı grupları bulup ayırt edersin.",
    teen: "2’li ve 3’lü siyah gruplarla klavyede yön bulursun.",
    adult: "Siyah tuş gruplarıyla oktav yönünü bilinçli tarif edersiniz.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün siyah tuşlara bakacağız. [kısa durak] Hazır mısın?",
      teen: "Selam. … Tuş coğrafyası: 2’li ve 3’lü siyahlar. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Hedef: siyah tuş gruplarıyla yön bulmak. [kısa durak] Hazır olduğunuzda devam.",
    },
    {
      child:
        "İki siyah yan yana… sonra boşluk… sonra üç siyah. [kısa durak] Bu düzen tekrar eder.",
      teen: "2 siyah → boşluk → 3 siyah → boşluk. … Bu döngü haritandır. [kısa durak]",
      adult:
        "İki siyahlı grup, boşluk, üç siyahlı grup — döngü referansınızdır. [kısa durak] Beyaz tuşlar tek başına yön vermez.",
    },
    {
      child: "Sola gidersen ses kalınlaşır. … Sağa gidersen incelir. [kısa durak]",
      teen: "Sol = kalın, sağ = ince. … Aynı grubu başka oktavda da bul.",
      adult:
        "Sol yön kalın, sağ ince. … Aynı 2’li grubu birkaç oktavda doğrulayın.",
    },
  ],
  theorySteps: [
    {
      child: "Klavyede iki siyahlı bir grup bul.",
      teen: "Bir 2’li siyah grup işaretle.",
      adult: "Bir 2’li siyah grubu bulun ve gösterin.",
    },
    {
      child: "Yanında üç siyahlı grubu bul.",
      teen: "Hemen yanındaki 3’lü grubu bul.",
      adult: "Komşu 3’lü siyah grubu doğrulayın.",
    },
  ],
  practiceSteps: [
    {
      child: "1) İki siyahlı grubu üç kez göster.",
      teen: "1) 2’li grup → 3’lü grup → yine 2’li; tempo yok.",
      adult: "1) 2’li ve 3’lü grupları sırayla işaretleyin; acele etmeyin.",
    },
    {
      child: "2) Ellerini kaldır, başka yerde yine iki siyah bul.",
      teen: "2) Elleri kaldır; bir oktav sağda aynı 2’liyi bul.",
      adult: "2) Elleri kaldırıp başka oktavda aynı 2’li grubu bulun.",
    },
    {
      child: "3) Üç siyahlı grubu bul; parmağınla say: bir-iki-üç.",
      teen: "3) 3’lü grubu bul; sol ve sağ yönünü söyle.",
      adult: "3) 3’lü grubu bulun; kalın/ince yönünü sözlü doğrulayın.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Siyah gruplar haritan. [kısa durak] Acele yok.",
      teen: "İyi. … Coğrafya kilitleniyor. [kısa durak] Hazır olunca onayla.",
      adult:
        "Tamam. … Grup döngüsü yerleşiyor. [kısa durak] Öz onaya geçebilirsiniz — kayıt gerekmez.",
    },
  ],
  selfCheckPrompt: {
    child: "İki ve üç siyahlı grubu gösterebiliyor musun? Evet dersen geçersin.",
    teen: "2’li ve 3’lü grupları ayırt edebildin mi? Onayla (kayıt yok).",
    adult:
      "2’li ve 3’lü siyah grupları bilinçli ayırt ettiniz mi? Onay = kapı (dinleme yok).",
  },
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Yakın otur. … Sessiz ortam.",
    teen: "Kısa ortam kaydı için sessiz tut.",
    adult: "Ortamı sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel. … Siyah gruplar net.",
    teen: "Oldu. … Harita tutarlı.",
    adult: "Hedef sağlandı. … Coğrafya yerleşti.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Sonraki derste eller serbest dokunacak. [kısa durak]",
      teen: "Geçtin. … Serbest el dokunuşuna geçebilirsin.",
      adult: "Tebrikler. … Sonraki: serbest el ve siyah tuş dokunuşu.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … İki siyahlı grubu bir kez daha bul. [kısa durak]",
      teen: "Geçmedi. … 2’li → 3’lü sırayı tekrar et.",
      adult: "Eşik tutmadı. … Grup döngüsünü yeniden doğrulayın.",
    },
  ],
  failMicroTarget: {
    child: "İki siyahlı grubu bul, sonra üç siyahlıyı göster.",
    teen: "2’li ve 3’lü grubu sırayla işaretle.",
    adult: "2’li ve 3’lü grupları iki oktavda doğrulayın.",
  },
};

/** M1.3 — serbest el + siyah tuş dokunuşu (Caner #1 hand drills, original copy). */
const M1_L3: LessonContent = {
  id: "piano.m1.l3",
  scoreRef: "score.piano.m1.l3.v0",
  listeningRequired: true,
  practiceVisual: "none",
  goals: {
    child: "Ellerini zorlamadan iki ve üç siyah tuşa dokunursun.",
    teen: "Serbest elle 2’li ve 3’lü siyah tuşlara kontrollü basarsın.",
    adult: "Zorlanmış el şekli olmadan siyah tuş dokunuşunu kurarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün eller serbest. [kısa durak] Yumuşak olsun.",
      teen: "Selam. … El serbest dursun — yumurta / top zorlaması yok. [kısa durak]",
      adult:
        "Merhaba. … En rahat asılı el pozisyonu yeter. [kısa durak] Şekil ezberi yok.",
    },
    {
      child: "İki siyah tuşa 2 ve 3. parmak. … Sonra üç siyaha 2-3-4. [kısa durak]",
      teen: "2’li: işaret + orta. … 3’lü: 2-3-4. Tempo yok.",
      adult:
        "İki siyah: 2–3. … Üç siyah: 2–3–4. Sol el simetrik; kalın tarafta.",
    },
  ],
  theorySteps: [
    {
      child: "Eli bırak — yürürken sallanır gibi.",
      teen: "Eli asılı bırak; bileği sıkma.",
      adult: "Eli doğal asılı bırakın; bileği sıkmayın.",
    },
    {
      child: "İki siyahın üstüne 2 ve 3. parmağı koy.",
      teen: "2’li siyah grubuna 2–3 yerleştir.",
      adult: "2’li gruba 2–3 parmakları yerleştirin.",
    },
  ],
  practiceSteps: [
    {
      child: "1) Sağ el: iki siyaha tek tek dokun — yavaş.",
      teen: "1) RH 2’li: 3 sonra 2; sonra birlikte bir kez.",
      adult: "1) Sağ el 2’li: ayrı sonra birlikte; omuz düşük kalsın.",
    },
    {
      child: "2) Aynı şeyi sol elle yap — kalın tarafta.",
      teen: "2) LH 2’li: 2 sonra 3; sonra birlikte.",
      adult: "2) Sol el 2’li aynı düzen; kalın oktav.",
    },
    {
      child: "3) Üç siyah: 2-3-4 ile tek tek, sonra birlikte.",
      teen: "3) RH 3’lü yürüyüş; sonra LH.",
      adult: "3) 3’lü siyah yürüyüşü sağ sonra sol; tempo düşük.",
    },
    {
      child: "4) 2’li → 3’lü → 2’li diye ilerle (sağa doğru).",
      teen: "4) 2’li–3’lü zincir; bir oktav sağa, geri dön.",
      adult: "4) 2’li–3’lü zinciri birkaç oktav; geri dönüş ekleyin.",
    },
  ],
  practiceBubbles: [
    {
      child: "Çok güzel. … El yumuşak mı? [kısa durak] Dinlemeye hazır mısın?",
      teen: "İyi. … Serbest el + siyah tuş. [kısa durak] Kayda geçebiliriz.",
      adult:
        "Tamam. … Dokunuş rahat. [kısa durak] Dinlemeye hazır olduğunuzda devam.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Siyah tuşlara dokunurken kaydedeceğiz. … Sessiz ortam.",
    teen: "Kısa 2’li–3’lü dokunuş kaydı. … Sessiz tut.",
    adult: "Kısa siyah tuş dokunuşunu kaydedin. … Ortamı sessiz tutun.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Eller yumuşak. [nefes] Kapıya bakabiliriz.",
    teen: "Oldu. … Dokunuş tutarlı. [kısa durak] Kapıya.",
    adult: "Kayıt alındı. … Serbest el hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Şimdi orta Do’yu bulacağız. [kısa durak]",
      teen: "Geçtin. … Orta Do haritasına geç.",
      adult: "Tebrikler. … Sonraki: orta Do referansı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Eli bırak, iki siyaha yavaş dokun. [kısa durak]",
      teen: "Geçmedi. … Omuz düşük, 2’li dokunuşu tekrar.",
      adult: "Eşik tutmadı. … Serbest el + 2’li dokunuş mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "İki siyaha yumuşak iki dokunuş.",
    teen: "RH 2’li: ayrı + birlikte, omuz düşük.",
    adult: "2’li siyah dokunuşunu omuz düşük tutarak üç tur.",
  },
};

/** M1.4 — orta Do (Caner: left of two blacks). */
const M1_L4: LessonContent = {
  id: "piano.m1.l4",
  scoreRef: "score.piano.m1.l4.v0",
  listeningRequired: true,
  practiceVisual: "none",
  goals: {
    child: "Orta Do’yu iki siyahlı grubun solundan bulursun.",
    teen: "Orta Do’yu 2’li siyah grubun solundaki beyaz tuşta kilitlersin.",
    adult: "Orta Do’yu iki siyahlı grubun solundaki beyaz tuş olarak yerleştirirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Bugün orta Do. [kısa durak] Hazır mısın?",
      teen: "Selam. … Orta Do haritası. [kısa durak] Başlayalım mı?",
      adult:
        "Merhaba. … Orta Do referansını kalıcı yerleştireceğiz. [kısa durak]",
    },
    {
      child:
        "İki siyahlı grubu bul. … Solundaki beyaz tuş Do. [kısa durak] Parmağınla göster.",
      teen: "2’li grubun solundaki beyaz = Do. … Ortadaki beyaz Re’dir — şimdi Do.",
      adult:
        "İki siyahlı grubun hemen solundaki beyaz tuş Do’dur. … İkisinin arası Re. [kısa durak] Önce Do’yu kilitleyin.",
    },
  ],
  theorySteps: [
    {
      child: "İki siyahlı grubu bul.",
      teen: "2’li siyah grubu bul.",
      adult: "2’li siyah grubu bulun.",
    },
    {
      child: "Solundaki beyaz tuşa dokun — o Do.",
      teen: "Solundaki beyaza dokun; adını söyle: Do.",
      adult: "Solundaki beyaza dokunun; Do referansını beş kez tekrarlayın.",
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
    {
      child: "Başka iki siyahlı grubun solunda da Do var — dene.",
      teen: "İki oktavda Do’ları sırayla göster.",
      adult: "Birkaç oktavda tüm Do’ları sırayla doğrulayın.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Solunda Do. [kısa durak] Dinlemeye hazır mısın?",
      teen: "İyi. … Referansı kilitle. [kısa durak] Dinlemeye?",
      adult:
        "Tamam. … Referans yerleşiyor. [kısa durak] Dinlemeye hazır olduğunuzda devam.",
    },
  ],
  recommendedMethod: "1",
  allowedMethods: ["1", "2"],
  listeningPrep: {
    child: "Orta Do’ya dokunurken kaydedeceğiz. … Sessiz ortam.",
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
      child: "Harika. … Şimdi Do’da 5 parmak. [kısa durak]",
      teen: "Geçtin. … Do pozisyonuna geç.",
      adult: "Tebrikler. … Sonraki: Do pozisyonu / 5 parmak.",
    },
  ],
  gateFailBubbles: [
    {
      child:
        "Sorun değil. … İki siyahın solundaki beyaza tekrar bak. [kısa durak]",
      teen: "Geçmedi. … Do bir tuş kaymış olabilir — sol tarafı kontrol et.",
      adult:
        "Eşik tutmadı. … 2’li grubun solundaki beyazı yeniden doğrulayın.",
    },
  ],
  failMicroTarget: {
    child: "İki siyahlı grubu bul, solundaki Do’yu göster.",
    teen: "2’li grubun solundaki beyaz tuşu bul.",
    adult: "2’li grubun solundaki beyaz tuşu beş kez doğrulayın.",
  },
};

/** M1.5 — Do pozisyonu / sağ el 5 parmak (Caner #2 hand + C position). */
const M1_L5: LessonContent = {
  id: "piano.m1.l5",
  scoreRef: "score.piano.m1.l5.v0",
  listeningRequired: true,
  practiceVisual: "none",
  goals: {
    child: "Do’dan başlayarak sağ el 1–5 parmakları yerleştirip yürürsün.",
    teen: "Do pozisyonunda sağ el 5 parmak yürüyüşünü kontrollü çalarsın.",
    adult: "Do pozisyonunda sağ el 1–5 tekniğini eşit süreyle çalarsınız.",
  },
  theoryBubbles: [
    {
      child: "Merhaba. … Parmak numaraları: 1 başparmak. [kısa durak] 5 serçe.",
      teen: "Selam. … Do pozisyonu: 1=Do … 5=Sol. [kısa durak]",
      adult:
        "Merhaba. … Do pozisyonu: 1 Do, 2 Re, 3 Mi, 4 Fa, 5 Sol. [kısa durak]",
    },
    {
      child: "Başparmak Do’da. … Diğerleri yan yana beyaz tuşlarda. [kısa durak]",
      teen: "1–5 yukarı, 5–1 aşağı — legato, yavaş.",
      adult: "1–5 ve 5–1; eşit süre, metronomsuz yavaş.",
    },
  ],
  theorySteps: [
    {
      child: "Başparmağı orta Do’ya koy.",
      teen: "1’i orta Do’ya; 2–5’i yan beyazlara.",
      adult: "1’i orta Do’ya yerleştirin; 2–5’i Do pozisyonuna dizin.",
    },
    {
      child: "Parmakları say: 1 2 3 4 5.",
      teen: "Numaraları sesli say, sonra sessiz çal.",
      adult: "Parmak numaralarını bir kez sesli, sonra sessiz uygulayın.",
    },
  ],
  practiceSteps: [
    {
      child: "1-2-3-4-5 yukarı, 5-4-3-2-1 aşağı — yavaş.",
      teen: "1–5 legato iki tur; tempo yok.",
      adult: "1–5 ve 5–1; üç tur, eşit süre.",
    },
    {
      child: "Do Re Mi Re Do — üç kez.",
      teen: "Do–Sol çıkış-iniş; iki kez.",
      adult: "Do–Sol melodik çizgi; üç tekrar.",
    },
  ],
  practiceBubbles: [
    {
      child: "Süper. … Yavaş yürüyüş. [kısa durak] Dinlemeye hazır mısın?",
      teen: "İyi. … 5 parmak oturuyor. [kısa durak] MIDI veya mic OK.",
      adult:
        "Tamam. … Pozisyon tutarlı. [kısa durak] Dinlemeye hazır olduğunuzda.",
    },
  ],
  recommendedMethod: "3",
  allowedMethods: ["3", "1", "2"],
  listeningPrep: {
    child: "MIDI klavye bağla. … Yoksa mic ile de olur. [kısa durak]",
    teen: "USB/MIDI önerilir. … Yöntem 1–2 yedek.",
    adult: "USB veya MIDI klavye önerilir. … Ortam/performans yedek.",
  },
  mockFeedback: {
    child: "Güzel deneme. … Parmaklar yerinde. [nefes] Kapıya bakabiliriz.",
    teen: "Oldu. … Do–Sol yürüyüşü tutarlı.",
    adult: "Kayıt alındı. … 5 parmak hedefi sağlandı.",
  },
  gatePassBubbles: [
    {
      child: "Harika. … Modül 1 kapısına yaklaşıyoruz. [kısa durak]",
      teen: "Geçtin. … Kapı parçasına hazırlan.",
      adult: "Tebrikler. … Sonraki: Modül 1 performans kapısı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … 1-2-3-4-5’i daha yavaş dene. [kısa durak]",
      teen: "Geçmedi. … 1–5 yürüyüşünü izole et.",
      adult: "Eşik tutmadı. … 1–5 eşit süre mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "1-2-3-4-5 yukarı, yavaş bir tur.",
    teen: "1–5 legato, iki yavaş tur.",
    adult: "1–5 ve 5–1; bir dakika yavaş.",
  },
};

/** M1.6 — gate: black groups + orta Do + short Do–Re–Mi. */
const M1_L6: LessonContent = {
  id: "piano.m1.l6",
  scoreRef: "score.piano.m1.gate.v0",
  listeningRequired: true,
  practiceVisual: "none",
  goals: {
    child: "Siyah grup + orta Do + kısa Do–Re–Mi’yi bir arada gösterirsin.",
    teen: "Coğrafya + orta Do + 5 parmak ezgisini kapıda birleştirirsin.",
    adult: "Klavye haritası + orta Do + kısa ezgiyi kapı parçasında gösterirsiniz.",
  },
  theoryBubbles: [
    {
      child: "Kapı günü. … Kısa şarkını çalacağız. [kısa durak] Yavaş.",
      teen: "Modül 1 kapısı. … Harita + ezgi. [kısa durak] Acele yok.",
      adult:
        "Modül 1 performans kapısı. … Tam kayıt. [kısa durak] Hazır olduğunuzda.",
    },
  ],
  theorySteps: [
    {
      child: "Önce iki siyahlı grubu ve orta Do’yu göster.",
      teen: "2’li grup → orta Do → Do pozisyonu.",
      adult: "2’li grup, orta Do ve Do pozisyonunu sırayla doğrulayın.",
    },
  ],
  practiceSteps: [
    {
      child: "Orta Do’yu bul; Do Re Mi Re Do çal — yavaş.",
      teen: "Kapı motifi: Do–Re–Mi–Re–Do + 1–5 yürüyüş.",
      adult: "Kapı: orta Do doğrula; Do–Sol kısa çizgi; baştan sona kaydedin.",
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
      child: "Harika. … Modül 1 bitti. [kısa durak] Nota zamanı!",
      teen: "Geçtin. … M2 teori / porte açıldı.",
      adult: "Tebrikler. … M2 teori omurgası açıldı.",
    },
  ],
  gateFailBubbles: [
    {
      child: "Sorun değil. … Orta Do + Do Re Mi’yi yumuşatalım. [kısa durak]",
      teen: "Geçmedi. … 1.4–1.5 mikro döngü — acele yok.",
      adult: "Eşik tutmadı. … Orta Do + 5 parmak mikro tekrarı.",
    },
  ],
  failMicroTarget: {
    child: "Orta Do + Do Re Mi Re Do, yavaş.",
    teen: "Kapı motifini yavaş iki tur.",
    adult: "Kapı parçasını bölümleyip yavaş birleştirin.",
  },
};

const CONTENT: Record<string, LessonContent> = {
  [M1_L1.id]: M1_L1,
  [M1_L2.id]: M1_L2,
  [M1_L3.id]: M1_L3,
  [M1_L4.id]: M1_L4,
  [M1_L5.id]: M1_L5,
  [M1_L6.id]: M1_L6,
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
    recommendedMethod: midiPracticeLesson(def)
      ? "3"
      : def.order >= 6
        ? "2"
        : "1",
    allowedMethods: midiPracticeLesson(def) ? ["3", "1", "2"] : ["1", "2"],
    listeningPrep: midiPracticeLesson(def)
      ? {
          child: "MIDI klavye bağla. … Yoksa mic ile de olur. [kısa durak]",
          teen: "USB/MIDI önerilir. … Yöntem 1–2 yedek.",
          adult: "USB veya MIDI klavye önerilir. … Ortam/performans yedek.",
        }
      : {
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

/** MIDI-first practice: Do-position walk + early M2 note pairs. */
function midiPracticeLesson(def: { moduleId: number; order: number; id: string }): boolean {
  if (def.id === "piano.m1.l5") return true;
  if (def.id === "piano.m2.l2") return true;
  if (def.id === "piano.m2.l3") return true;
  return false;
}
