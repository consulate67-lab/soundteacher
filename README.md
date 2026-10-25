# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–H** MVP iskeletidir (sertleştirme dahil).

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aç: [http://localhost:3000](http://localhost:3000)

## Vercel deploy

App is a standard **Next.js** App Router project (`vercel.json` sets framework). In-memory stores (users/Path/Attempt) reset across serverless cold starts — fine for MVP demo; Postgres later.

### Dashboard (recommended)

1. Open [vercel.com/new](https://vercel.com/new) → **Import** GitHub repo `consulate67-lab/soundteacher`
2. Branch: `cursor/mvp-scaffold-a-f7f9` (or `main` after merge)
3. Framework: **Next.js** (auto) → Deploy
4. **Environment Variables** (Settings → Environment Variables), then Redeploy:

| Name | Required? | Value |
| --- | --- | --- |
| `AUTH_SECRET` | **Yes** | `openssl rand -base64 32` output |
| `AUTH_URL` | Optional | `https://YOUR-PROJECT.vercel.app` |
| `STRIPE_*` | No | leave empty → mock billing |
| `DATABASE_URL` / `S3_*` / `TTS_*` | No | unused in MVP mock |

### CLI

```bash
npx vercel login
npx vercel link   # pick team + project
npx vercel env add AUTH_SECRET
npx vercel --prod
```

Anonymous / claimable preview (no account): `npx vercel deploy --temporary` — expires quickly; claim via the printed URL.

## Kritik yol (signup → Y1)

1. **Kayıt** — `/signup` (e-posta + şifre; Auth.js Credentials mock)
2. **Plan** — `/plans` → deneme/aylık seç → mock Stripe checkout → `/checkout/success`
3. **Yerleştirme** — `/placement` → yaş bandı → beceri soruları → (gerekirse) doğrulama → Path oluşur
4. **Path Home** — `/home` → M1–M4 omurga + açık ders
5. **Ders** — teori → pratik → **Dinleme handoff**
6. **Yöntem 1** — mic izni → geri sayım → kısa ortam kaydı → analiz stub → geri bildirim → kapı

Yöntem 2 (performans) handoff’tan seçilebilir; kota dolunca Y1’e düşer.

## Dilim özeti

| Dilim | İçerik                                             |
| ----- | -------------------------------------------------- |
| A–B   | Scaffold, Auth.js, Stripe mock                     |
| C     | Yerleştirme + Path Home                            |
| D     | M1 ders kabuğu                                     |
| E–F   | Yöntem 1–2 MediaRecorder + kota                    |
| G     | M2–M4 omurga, scoreRef, kapı metrikleri            |
| H     | **PWA**, structured log, Saklama A, Web Speech TTS |

## Dilim H notları

- **PWA:** `public/manifest.webmanifest` + light `sw.js` (prod’da register). Tarayıcıdan “Ana ekrana ekle / Install” — offline tam garanti değil.
- **Gözlem:** `src/lib/logger.ts` — Attempt/Gate/API için tek satır JSON log.
- **Saklama A:** analiz sonrası ham ses discard (`src/lib/audio-retention.ts`); Attempt’te yalnızca özet kalır.
- **TTS:** öğretmen balonlarında opsiyonel Web Speech (`Dinle`); ücretli TTS anahtarı yok.

## M1–M4

- Spine: `piano.m{1–4}.l{1–6}` (24 ders) · bant başlıkları overlay
- Zengin kabuk: M1.L1/L2 + M2–M4 L1/L6; diğerleri generic overlay
- Kapı metrikleri: `src/lib/gate-metrics.ts`

## Sonraki adımlar (kod yazma yok — merge sonrası)

- Gerçek pitch / align analyzer (worker)
- Stripe live keys + Customer Portal
- Postgres + S3 lifecycle (Saklama A delete)
- Opsiyonel bulut TTS cache

M5–7 / MIDI: post-MVP.
