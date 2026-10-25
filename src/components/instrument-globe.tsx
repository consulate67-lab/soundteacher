"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";

type Instrument = {
  id: string;
  label: string;
  active: boolean;
  angle: number;
};

const INSTRUMENTS: Instrument[] = [
  { id: "piano", label: "Piyano", active: true, angle: 0 },
  { id: "keman", label: "Keman", active: false, angle: 72 },
  { id: "saz", label: "Saz", active: false, angle: 144 },
  { id: "gitar", label: "Gitar", active: false, angle: 216 },
  { id: "flut", label: "Flüt", active: false, angle: 288 },
];

/**
 * CSS 3D “world of instruments” orb — Piano active → signup; others “yakında”.
 */
export function InstrumentGlobe({
  ctaHref = "/signup",
}: {
  ctaHref?: string;
}) {
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState(0);

  return (
    <div className="relative mx-auto flex w-full max-w-[22rem] flex-col items-center sm:max-w-[26rem]">
      <div
        className="st-globe-scene relative aspect-square w-full max-w-[20rem] sm:max-w-[24rem]"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          setPaused(false);
          setTilt(0);
        }}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          setTilt(x * 18);
        }}
      >
        <div
          className={`st-globe-core ${paused ? "st-globe-paused" : ""}`}
          style={{ transform: `rotateX(12deg) rotateY(${tilt}deg)` }}
        >
          <div className="st-globe-sphere" />
          <div className="st-globe-ring" />
          <div className="st-globe-ring st-globe-ring-2" />
          <ul className="st-globe-orbit">
            {INSTRUMENTS.map((inst) => {
              const style = { ["--a" as string]: `${inst.angle}deg` } as CSSProperties;
              return (
                <li key={inst.id} className="st-globe-item" style={style}>
                  {inst.active ? (
                    <Link href={ctaHref} className="st-globe-chip st-globe-chip-active">
                      <span className="st-globe-chip-label">{inst.label}</span>
                      <span className="st-globe-chip-meta">Başla</span>
                    </Link>
                  ) : (
                    <span className="st-globe-chip st-globe-chip-soon">
                      <span className="st-globe-chip-label">{inst.label}</span>
                      <span className="st-globe-chip-meta">Yakında</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <p className="mt-4 text-center text-xs text-white/70">
        Dünyayı çevir — şimdi <strong className="text-accent">Piyano</strong> açık;
        diğer enstrümanlar yakında.
      </p>
    </div>
  );
}
