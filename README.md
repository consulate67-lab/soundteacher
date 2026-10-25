# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–E** iskeletidir.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

HTTPS veya `localhost` gerekir (mikrofon). `npm run build` ücretli API / DB olmadan yeşil.

## Auth / Stripe / Path

- **Auth.js** Credentials mock · Stripe mock checkout · in-memory Path/Subscription

## Ders + Dinleme Yöntem 1 (Dilim D–E)

`/lessons/[id]` fazları:

1. Teori (S30) → Pratik (S31)
2. **Yöntem 1** (S32–S33): izin (S40) → geri sayım → MediaRecorder → upload stub
3. Analiz: pluggable `AudioAnalyzer` (`src/lib/analysis/`) — **stub** (süre/boyut + attempt indeksi); gerçek worker sonra takılır
4. Geçersiz: S42–S44 (sessizlik / gürültü / düşük ses) — kapı yazılmaz
5. S35: tek birincil hata + öğretmen baloncukları (`…` / durak)
6. S36/S37: GateResult from Attempt → unlock veya soft retry

`POST /api/listening/analyze` — multipart audio, Attempt bellekte.

## Dilim özeti

| Dilim | İçerik                                     |
| ----- | ------------------------------------------ |
| A     | Next.js scaffold, CI, şema                 |
| B     | Auth.js + Stripe mock, S01–S04             |
| C     | Yerleştirme + Path Home                    |
| D     | M1 ders kabuğu                             |
| E     | Yöntem 1 MediaRecorder + Attempt/Gate stub |

Sonraki (**F**): Yöntem 2 + kota.

Mimari: `mvp-teknik-mimari.md` §5 · dinleme: `dinleme-ve-ogretmen-konusmasi.md`.
