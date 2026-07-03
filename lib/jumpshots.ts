import type { JumpshotBase, ReleaseSpeed } from "./types";

/**
 * Catálogo de bases de jumpshot con timings estimados (punto de partida).
 * Los valores buttonReleaseMs provienen de investigación pública de la
 * comunidad de NBA 2K26 y SIEMPRE deben calibrarse en el gimnasio
 * (My Court / práctica) con el menú OLED del script.
 */
export const JUMPSHOT_BASES: JumpshotBase[] = [
  {
    id: "curry",
    name: "Base Stephen Curry",
    speed: "very-fast",
    buttonReleaseMs: 380,
    rhythmWaitMs: 22,
  },
  {
    id: "tatum",
    name: "Base Jayson Tatum",
    speed: "normal",
    buttonReleaseMs: 425,
    rhythmWaitMs: 30,
  },
  {
    id: "kobe",
    name: "Base Kobe Bryant",
    speed: "slow",
    buttonReleaseMs: 440,
    rhythmWaitMs: 34,
  },
  {
    id: "lebron",
    name: "Base LeBron James",
    speed: "slow",
    buttonReleaseMs: 450,
    rhythmWaitMs: 36,
  },
  {
    id: "durant",
    name: "Base Kevin Durant",
    speed: "normal",
    buttonReleaseMs: 430,
    rhythmWaitMs: 31,
  },
  {
    id: "sga",
    name: "Base Shai Gilgeous-Alexander",
    speed: "normal",
    buttonReleaseMs: 428,
    rhythmWaitMs: 30,
  },
  {
    id: "ray-allen",
    name: "Base Ray Allen",
    speed: "fast",
    buttonReleaseMs: 400,
    rhythmWaitMs: 26,
  },
  {
    id: "klay",
    name: "Base Klay Thompson",
    speed: "fast",
    buttonReleaseMs: 405,
    rhythmWaitMs: 27,
  },
  {
    id: "post-fade",
    name: "Base Post Fade",
    speed: "very-slow",
    buttonReleaseMs: 510,
    rhythmWaitMs: 44,
  },
  {
    id: "custom",
    name: "Otra / personalizada (timing genérico)",
    speed: "normal",
    buttonReleaseMs: 430,
    rhythmWaitMs: 30,
  },
];

/** Ajuste de timing (ms) al forzar una velocidad de release distinta a la de la base. */
export const SPEED_OFFSET_MS: Record<ReleaseSpeed, number> = {
  "very-fast": -45,
  fast: -25,
  normal: 0,
  slow: 15,
  "very-slow": 80,
};

export function getJumpshot(id: string): JumpshotBase {
  const found = JUMPSHOT_BASES.find((j) => j.id === id);
  if (!found) {
    throw new Error(`Jumpshot base desconocida: ${id}`);
  }
  return found;
}

export const RELEASE_SPEED_LABELS: Record<ReleaseSpeed, string> = {
  "very-fast": "Muy rápida",
  fast: "Rápida",
  normal: "Normal",
  slow: "Lenta",
  "very-slow": "Muy lenta",
};
