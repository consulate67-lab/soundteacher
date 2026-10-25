# SoundTeacher (SoungTeacher)

Çevrim içi piyano öğretmeni — abonelik, yaş × seviye öğrenme yolu ve dinleme geri bildirimi.

Ürün adı: **SoundTeacher** · proje / marka notu: **SoungTeacher**.

Bu depo **Faz 1 / Dilim A–F** iskeletidir.

## Yerel çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mikrofon için `localhost` / HTTPS. `npm run build` ücretli API / DB olmadan yeşil.

## Dilim özeti

| Dilim | İçerik                                     |
| ----- | ------------------------------------------ |
| A     | Next.js scaffold, CI, şema                 |
| B     | Auth.js + Stripe mock, S01–S04             |
| C     | Yerleştirme + Path Home                    |
| D     | M1 ders kabuğu                             |
| E     | Yöntem 1 MediaRecorder + Attempt/Gate stub |
| F     | Yöntem 2 performans + kota (S22/S34/S45)   |

## Dinleme + kota (E–F)

- **Y1:** kısa ortam kaydı · yüksek kota
- **Y2:** uzun performans · bitiş raporu · düşük kota · kayıtta AI sus / canlı hata yok
- Pluggable `AudioAnalyzer` stub (`src/lib/analysis/`)
- Handoff’ta yöntem seçimi; Y2 dolunca **S22** → Y1’e düşür (ders kilitlenmez)

### Kota kuralları (`src/lib/quota.ts`)

1. Geçerli tamamlanmış Attempt → 1 birim (yönteme göre)
2. Geçersiz (sessizlik / gürültü / düşük ses) → **kota yok**
3. **Abandoned (S45):** Y2 &lt; 5 sn veya “Yarıda bırak” → Attempt `abandoned`, **kota yok**, kapı yok

## Sonraki

Dilim G içerik genişletme · H sertleştirme · MIDI post-MVP.

Mimari: `mvp-teknik-mimari.md` · dinleme: `dinleme-ve-ogretmen-konusmasi.md`.
