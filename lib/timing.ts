import { getJumpshot, SPEED_OFFSET_MS } from "./jumpshots";
import type { BuildInput, ShotMethod, TimingResult } from "./types";

interface RatingTier {
  min: number;
  /** Offset (ms) sobre el release base: ratings bajos animan más lento. */
  offsetMs: number;
  /** Jitter (+/- ms) aleatorio para humanizar y cubrir la ventana. */
  jitterMs: number;
}

/**
 * Tiers por rating de triple (NBA 2K26). A mayor rating, la ventana green
 * es un poco más ancha y el release óptimo llega antes, así que el offset
 * baja y el jitter se reduce.
 */
const RATING_TIERS: RatingTier[] = [
  { min: 95, offsetMs: -25, jitterMs: 6 },
  { min: 90, offsetMs: -15, jitterMs: 8 },
  { min: 85, offsetMs: 0, jitterMs: 8 },
  { min: 80, offsetMs: 10, jitterMs: 10 },
  { min: 75, offsetMs: 30, jitterMs: 12 },
  { min: 0, offsetMs: 45, jitterMs: 14 },
];

function tierFor(threeRating: number): RatingTier {
  return RATING_TIERS.find((t) => threeRating >= t.min) ?? RATING_TIERS[RATING_TIERS.length - 1];
}

/**
 * Calcula el timing inicial estimado del auto green.
 *
 * - Método botón: ms desde que se presiona Square hasta soltar.
 * - Método rhythm: ms entre RS abajo y el snap de RS arriba (escala pequeña).
 *
 * El valor es un punto de partida: debe calibrarse en el gimnasio con el
 * menú OLED del script (+/- 1ms).
 */
export function computeTiming(build: BuildInput, method: ShotMethod): TimingResult {
  const jumpshot = getJumpshot(build.jumpshotId);
  const tier = tierFor(build.threeRating);

  const speed = build.releaseSpeedOverride ?? jumpshot.speed;
  const speedOffset =
    build.releaseSpeedOverride && build.releaseSpeedOverride !== jumpshot.speed
      ? SPEED_OFFSET_MS[speed] - SPEED_OFFSET_MS[jumpshot.speed]
      : 0;

  if (method === "button") {
    const waitMs = jumpshot.buttonReleaseMs + tier.offsetMs + speedOffset;
    return { waitMs: clamp(waitMs, 200, 900), jitterMs: tier.jitterMs };
  }

  // Rhythm: la escala es mucho menor (delay entre pull y snap del stick).
  // Escalamos el offset del tier a ~1/10 para mantener proporción.
  const waitMs = jumpshot.rhythmWaitMs + Math.round(tier.offsetMs / 10) + Math.round(speedOffset / 10);
  return { waitMs: clamp(waitMs, 5, 200), jitterMs: Math.max(1, Math.round(tier.jitterMs / 4)) };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
