# Falling Notes

Tablet-on-music-stand practice game: **Synthesia-like falling note drops** matched to a real piano via the **tablet microphone** (no USB MIDI required). Sibling product to the SoundTeacher lesson app — lives in `falling-notes/` and does not share Next.js routes.

Turkish UI · landscape-first · Vite + React + TypeScript.

## Exercises

Charts live in `src/engine/catalog.ts` / `songMelodies.ts` as note sequences (pedagogical arrangements, not commercial sheet dumps). **100+** entries with Turkish titles, organized under top-level **Türkçe / Yabancı** headings, then by **type** (Gam / Teknik / Çocuk / Klasik / Halk / Popüler) and **difficulty** (Başlangıç / Orta / İleri). The in-app picker is a **scrollable list** (not a dropdown), with locale + difficulty chips and a “Siyah tuş” badge when black keys appear.

**Audio:** with **Piyano referans** on, falling notes trigger pitched **Salamander grand-piano samples** (`public/samples/piano`, Web Audio buffers + playbackRate). Sample durations follow chart note lengths so the piece sounds like music tied to real pitches.

Turkish UI labels use solfege + pedagogical octave (**Do1** = scientific C4, **Do2** = C5). Black-key drops use a distinct silhouette + `#` badge; the on-screen piano shows tall, high-contrast black keys.

Play at 0.5× / 0.75× / 1× via tempo scale.

## Run locally

```bash
cd falling-notes
npm install
npm run dev
```

Open the printed URL (default `http://localhost:5173`) on a phone/tablet in **landscape**, or use desktop DevTools device mode.

Allow microphone access when prompted. Place the tablet on the music stand, aim the mic toward the piano, then **Başlat**.

### Scripts

| Command           | Purpose               |
| ----------------- | --------------------- |
| `npm run dev`     | Vite dev server       |
| `npm run build`   | Production build      |
| `npm run preview` | Serve `dist/` locally |

## MVP features

1. **Falling notes engine** — larger labeled drops (Do1/Re1/…) fall onto a hit line above a real-looking on-screen piano. Drop **height encodes duration** (½ / 1 / 2 / 4 beats); fill shows hold progress.
2. **Hold matching** — attack within the hit window, then keep the pitch for ~70% of the written duration (tempo scale stretches the real hold; short mic gaps forgiven).
3. **Color mapping** — each drop uses the same pitch-class color as its target piano key; black-key targets are visually distinct.
4. **Piano keyboard UI** — realistic white/black layout; keys light for expected / holding / hit / miss / detected; mic match stays primary.
5. **Tempo control** — clock/tempo scale on chart events (`tempoScale`); optional Web Audio triangle synth reference at the same tempo.
6. **Mic pitch detection** — `getUserMedia` → `AnalyserNode` + autocorrelation; match within ±100–200 ms; noise gate; green/red feedback. Monophonic-first.
7. **Wait-for-note mode** — scroll freezes until attack, then until the required hold completes (`Notayı bekle`).
8. **Exercise list** — scrollable catalog by type + difficulty (≥100 public-domain / teaching motifs).

## Pitch detection limits & next steps

- Autocorrelation is **monophonic**. Chords and overlapping notes will confuse it.
- Room noise, pedal resonance, and distant mics need a higher noise-gate threshold.
- **Next step:** integrate [Basic Pitch](https://github.com/spotify/basic-pitch) (or similar) for polyphonic transcription, plus optional **Web MIDI** / headphone line-in adapters. See architecture doc.

## Architecture

Project store doc (owner-facing):  
`/cursor/stores/self/docs/falling-notes-architecture.md`  
(also mirrored conceptually in this README).

## Deploy

This folder is a static Vite app. Point Vercel (or any static host) at `falling-notes/` with:

- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Install command:** `npm install`

Root SoundTeacher Next.js app is unchanged.
