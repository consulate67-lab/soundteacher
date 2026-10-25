# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A + B + C** iskeletidir.

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

Abonelik + Path şu an **in-memory** (`subscription-store`, `path-store`). Şema taslağı: `db/schema.sql`.

## Yerleştirme + Path (Dilim C)

Akış: **S10** bant → **S11** beceri soruları → (A2/B1 ise **S12** mock doğrulama) → **S13** sonuç → **S20** Path Home.

`POST /api/placement` skor stub’ı `{ band, level, module_entry, default_session_minutes }` üretir ve Path kaydeder.

## Rotalar

| Yol                     | Ekran              | Not                         |
| ----------------------- | ------------------ | --------------------------- |
| `/`                     | Landing            |                             |
| `/signup`               | **S01**            | → `/plans`                  |
| `/login`                | Giriş              | → `/home`                   |
| `/plans`                | **S02**            | Plan + checkout             |
| `/checkout/success`     | **S03**            | → `/placement` (Path yoksa) |
| `/billing/past-due`     | **S04**            |                             |
| `/placement`            | **S10**            | Yaş bandı                   |
| `/placement/skills`     | **S11**            | Bantlı sorular              |
| `/placement/verify`     | **S12**            | Mock doğrulama              |
| `/placement/result`     | **S13**            | Path özeti                  |
| `/placement/incomplete` | **S14**            | Yarım hatırlatma            |
| `/home`                 | **S20**            | Kilitli/açık ders haritası  |
| `/lessons/[id]/locked`  | **S21**            | Kilit mesajı                |
| `/lessons/[id]`         | Ders kabuğu        | Dilim D hazırlığı           |
| `/api/health`           | Healthcheck        |                             |
| `/api/placement`        | Placement stub     |                             |
| `/api/stripe/*`         | Checkout / webhook |                             |

## Scriptler

```bash
npm run lint
npm run format
npm run build
npm start
```

## Dilim özeti

- **A:** Next.js iskelet, CI, env, şema, healthcheck, S01
- **B:** Auth.js, Stripe mock, S02–S04, entitlement `/home` kapısı
- **C:** Yerleştirme S10–S14, Path Home S20–S21, M1/M2 mock müfredat

Sonraki (**D**): Ders kabuğu M1 (S30–S31, S38).

Mimari: `mvp-teknik-mimari.md` §8 · yerleştirme: `yerlestirme-ve-modul-1-2.md`.
