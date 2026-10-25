# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Bu depo **Faz 1 / Dilim A** iskeletidir: Next.js (App Router) + TypeScript. Gerçek auth, Stripe, analiz worker ve TTS henüz yok.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local   # isteğe bağlı; yer tutucu anahtarlar
npm run dev
```

Tarayıcı: [http://localhost:3000](http://localhost:3000)

| Yol           | Açıklama                                           |
| ------------- | -------------------------------------------------- |
| `/`           | Ana sayfa                                          |
| `/signup`     | **S01** kayıt iskeleti (TR kopya, gerçek auth yok) |
| `/api/health` | Healthcheck JSON                                   |

Diğer scriptler:

```bash
npm run lint
npm run format
npm run build
npm start
```

## Dilim A kapsamı

- Next.js App Router + TypeScript + Tailwind
- ESLint + Prettier + GitHub Actions CI
- `.env.example` — `AUTH_`, `STRIPE_`, `DATABASE_URL`, `S3_`, `TTS_`
- Postgres şema taslağı: [`db/schema.sql`](./db/schema.sql) + Prisma sketch [`prisma/schema.prisma`](./prisma/schema.prisma)
- Canlı DB / ödeme / dinleme **gerekmez**

Sonraki dilim (**B**): Auth + Stripe Checkout / webhooks / Entitlement.

Mimari referans (proje store): `mvp-teknik-mimari.md` §10.
