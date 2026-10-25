# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–D** iskeletidir.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local   # AUTH_SECRET yeter; Stripe anahtarı zorunlu değil
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

`npm run build` Stripe / DB / mic olmadan yeşil kalır (mock mode).

## Auth seçimi (Dilim B)

**Auth.js** (`next-auth` v5) + **Credentials** sağlayıcısı (mock in-memory). Clerk bağlanmadı.

## Stripe / abonelik

`STRIPE_SECRET_KEY` boşsa **mock checkout/webhook**. Abonelik + Path + ders ilerlemesi in-memory.

## Yerleştirme + Path (Dilim C)

S10–S14 → Path `{ band, level, module_entry, default_session_minutes }` → S20/S21.

## Ders kabuğu M1 (Dilim D)

`/lessons/[id]` faz makinesi:

1. **S30 Teori** — bantlı hedefler + öğretmen baloncukları (`…` / `[kısa durak]` / `[nefes]`)
2. **S31 Pratik** — adım listesi
3. **S32 Dinleme handoff** — yöntem önerisi; **mock kayıt** (MediaRecorder Dilim E)
4. **S35–S38** — mock gate pass → unlock sonraki ders; mock fail → soft retry

İçerik: `src/lib/lesson-content.ts` (M1.L1 / M1.L2 dolu; diğerleri generic shell).

## Rotalar (özet)

| Yol                             | Ekran              |
| ------------------------------- | ------------------ |
| `/signup` … `/billing/past-due` | S01–S04            |
| `/placement/*`                  | S10–S14            |
| `/home`                         | S20                |
| `/lessons/[id]/locked`          | S21                |
| `/lessons/[id]`                 | S30–S38 kabuğu     |
| `/api/placement`                | Placement stub     |
| `/api/stripe/*`                 | Checkout / webhook |

## Dilim özeti

- **A:** Scaffold + CI + şema + S01
- **B:** Auth.js + Stripe mock + S02–S04
- **C:** Yerleştirme + Path Home
- **D:** M1 ders kabuğu + gate unlock

Sonraki (**E**): MediaRecorder, Attempt, gerçek gate metrikleri, TTS.

Mimari: `mvp-teknik-mimari.md` §8.
