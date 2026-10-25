# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–H** MVP iskeletidir (sertleştirme dahil).

## Preferred: production on Vercel

**Production URL:** https://soundteacher-consulate67-gmailcoms-projects.vercel.app  

**Use that URL for testing** — not `npm run dev` / localhost, unless you are editing code locally.

App is standard **Next.js** App Router (`vercel.json`). In-memory stores reset on serverless cold starts (MVP OK; Postgres later).

### One-time: Import GitHub → permanent URL

1. Open [vercel.com/new](https://vercel.com/new) → **Import** `consulate67-lab/soundteacher`
2. Branch: **`cursor/mvp-scaffold-a-f7f9`** (or `main` after merge — merge is optional until live works)
3. Framework: **Next.js** (auto) → **Deploy**
4. **Settings → Environment Variables** → add, then **Redeploy**:

| Name | Required? | Value |
| --- | --- | --- |
| `AUTH_SECRET` | **Yes** | run `openssl rand -base64 32` and paste |
| `AUTH_URL` | Optional | `https://YOUR-PROJECT.vercel.app` |
| `STRIPE_*` | No | leave empty → mock billing |
| `DATABASE_URL` / `S3_*` / `TTS_*` | No | unused in MVP mock |

5. Copy the Production URL (`https://….vercel.app`) and use that for QA.

### Agent / CI permanent deploy (optional)

Cloud agent **cannot** create a sticky production URL without a Vercel token:

1. [vercel.com/account/tokens](https://vercel.com/account/tokens) → create token  
2. Add secret **`VERCEL_TOKEN`** to the Cursor cloud agent / environment (and optionally `VERCEL_ORG_ID` + `VERCEL_PROJECT_ID` after first `vercel link`)  
3. Re-run agent → `npx vercel deploy --prod --yes` with `AUTH_SECRET` set on the project

```bash
npx vercel login          # or export VERCEL_TOKEN=…
npx vercel link           # project: soundteacher
npx vercel env add AUTH_SECRET production
npx vercel --prod --yes
```

Anonymous `npx vercel deploy --temporary` expires in ~60 minutes — claim via the printed claim URL, or use Dashboard Import above for a permanent project.

### Claim a temporary deploy (fast keep)

If the agent printed a **claim** link (`vercel.com/claim-deployment?code=…`), open it while logged into Vercel to attach that build to your account/project.

## Local dev (optional)

```bash
npm install
cp .env.example .env.local
# set AUTH_SECRET in .env.local
npm run dev
```

http://localhost:3000 — only when iterating on code.

## Kritik yol (signup → Y1)

1. **Kayıt** — `/signup` (e-posta + şifre; Auth.js Credentials mock)
2. **Plan** — `/plans` → deneme/aylık seç → mock Stripe checkout → `/checkout/success`
3. **Yerleştirme** — `/placement` → yaş bandı → beceri soruları → (gerekirse) doğrulama → Path oluşur
4. **Path Home** — `/home` → M1–M4 omurga + açık ders
5. **Ders** — teori → pratik → **Dinleme handoff**
6. **Yöntem 1** — mic izni → geri sayım → kısa ortam kaydı → analiz demo → geri bildirim → kapı

Yöntem 2 (performans) handoff’tan seçilebilir; kota dolunca Y1’e düşer.

**Yöntem 3 (MIDI / USB klavye):** Web MIDI API (Chrome/Edge). Nota-on/off + zamanlama → aynı Attempt / S35 / Kapı yolu. Mic yok. Kota Yöntem 1 ile paylaşılır. Erken M1 mic-first / öz-onay kalır; MIDI önerisi: **`piano.m1.l5`**, **`piano.m2.l2`**, **`piano.m2.l3`**. Destek yoksa net TR uyarı + Y1/Y2 fallback.

**Müfredat esinlenmesi:** M1–M2 ders sırası Caner Başbuğa’nın herkese açık başlangıç serisindeki konu ilerlemesinden uyarlanmıştır (tuşlar → serbest el → orta Do → teori → Re/Si…). YouTube videoları indirilmez / gömülmez; SoundTeacher kendi öğretmen sesi ve dinleme yığınıyla çalışır.

## Dilim özeti

| Dilim | İçerik |
| --- | --- |
| A–B | Scaffold, Auth.js, Stripe mock |
| C | Yerleştirme + Path Home |
| D | M1 ders kabuğu |
| E–F | Yöntem 1–2 MediaRecorder + kota |
| E+ | Yöntem 3 Web MIDI (USB klavye) |
| G | M2–M4 omurga, scoreRef, kapı metrikleri |
| H | **PWA**, structured log, Saklama A, Web Speech TTS |

## Dilim H notları

- **PWA:** `public/manifest.webmanifest` + light `sw.js` (prod’da register). Installable — offline not guaranteed.
- **Gözlem:** `src/lib/logger.ts` — Attempt/Gate/API JSON lines.
- **Saklama A:** discard raw audio after analysis; Attempt keeps summary only.
- **TTS:** optional Web Speech on teacher bubbles; no paid TTS keys.

## M1–M4

- Spine: `piano.m{1–4}.l{1–6}` (24 ders) · bant başlıkları overlay
- Zengin kabuk: M1.L1–L6 + M2.L1–L6 + M3/M4 L1/L6; diğerleri generic overlay (Caner-aligned M1–M2 sırası)
- Kapı metrikleri: `src/lib/gate-metrics.ts`

## Sonraki adımlar

- Paste permanent Vercel URL into the PR / chat once Dashboard Import (or claim) is done
- Merge PR #1 after production smoke is green (optional order: live first, then merge)
- Real pitch analyzer · Stripe live keys · Postgres + S3

M5–7: post-MVP. Method 3 MIDI demo analyzer: `src/lib/analysis/midi-analyzer.ts`.
