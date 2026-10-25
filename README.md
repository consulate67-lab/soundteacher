# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–G** iskeletidir.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Dilim özeti

| Dilim | İçerik                                                 |
| ----- | ------------------------------------------------------ |
| A–B   | Scaffold, Auth.js, Stripe mock                         |
| C     | Yerleştirme + Path Home                                |
| D     | M1 ders kabuğu                                         |
| E–F   | Yöntem 1–2 MediaRecorder + kota                        |
| G     | **M2–M4 omurga genişletme**, scoreRef, kapı metrikleri |

## M1–M4 (Dilim G)

- Ortak spine: `piano.m{1–4}.l{1–6}` (24 ders) · bant başlıkları overlay
- Zengin kabuk: M1.L1/L2 + M2.L1/L6 + M3.L1/L6 + M4.L1/L6; diğerleri modül-bilinçli generic
- `scoreRef` stub her derste; kapı derslerinde `score.piano.mN.gate.v0`
- Kapı metrikleri: `src/lib/gate-metrics.ts` (tunable placeholders)
- Path Home: M1–M4 durum şeridi + giriş→M4 ders haritası
- Dinleme Y1/Y2 yeni derslerde aynı akışla çalışır

M5–7 / MIDI: post-MVP.

Mimari: `mvp-teknik-mimari.md` · M3–4: `modul-3-4.md`.
