# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A + B** iskeletidir.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local   # AUTH_SECRET yeter; Stripe anahtarı zorunlu değil
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

`npm run build` Stripe / DB olmadan yeşil kalır (mock mode).

## Auth seçimi (Dilim B)

**Auth.js** (`next-auth` v5) + **Credentials** sağlayıcısı.

- Mock kullanıcılar süreç belleğinde tutulur (Postgres yok).
- Kayıt veya giriş: geçerli e-posta + en az 8 karakter şifre.
- Clerk bağlanmadı; mimaride alternatif olarak kalır.

## Stripe / abonelik

| Durum                   | Davranış                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY` boş | **Mock mode** — checkout başarı URL’sine yönlendirir; webhook JSON stub |
| Test anahtarları dolu   | Checkout Session + imzalı webhook yolu                                  |

Abonelik durumu (`trial` / `active` / `past_due` / `canceled`) + entitlement şu an **in-memory** store’da (`src/lib/subscription-store.ts`). Şema taslağı: `db/schema.sql`.

Mock webhook örneği:

```bash
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H 'Content-Type: application/json' \
  -d '{"type":"invoice.payment_failed","data":{"userId":"usr_…"}}'
```

## Rotalar

| Yol                    | Ekran            | Not                                    |
| ---------------------- | ---------------- | -------------------------------------- |
| `/`                    | Landing          |                                        |
| `/signup`              | **S01**          | Kayıt → `/plans`                       |
| `/login`               | Giriş            | → `/home` (entitlement yoksa `/plans`) |
| `/plans`               | **S02**          | Plan seçimi + checkout stub            |
| `/checkout/success`    | **S03**          | Mock/Stripe dönüş; abonelik etkin      |
| `/billing/past-due`    | **S04**          | `past_due` duvarı                      |
| `/home`                | Path Home kabuğu | `trial`/`active` gerekir               |
| `/api/health`          | Healthcheck      |                                        |
| `/api/stripe/checkout` | Checkout stub    |                                        |
| `/api/stripe/webhook`  | Webhook stub     |                                        |

## Scriptler

```bash
npm run lint
npm run format
npm run build
npm start
```

## Dilim özeti

- **A:** Next.js App Router + TS, lint/format/CI, env, şema taslağı, healthcheck, S01 kabuğu
- **B:** Auth.js, Stripe mock/test wiring, S02–S04, entitlement korumalı `/home`

Sonraki (**C**): Yerleştirme + Path.

Mimari: proje store `mvp-teknik-mimari.md` §8–10 · abonelik: `abonelik-iskeleti.md`.
