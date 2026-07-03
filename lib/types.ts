export type ShotMethod = "button" | "rhythm";

export type ReleaseSpeed =
  | "very-fast"
  | "fast"
  | "normal"
  | "slow"
  | "very-slow";

export interface JumpshotBase {
  id: string;
  name: string;
  speed: ReleaseSpeed;
  /** Timing estimado (ms) desde que inicia el tiro hasta el release, método botón. */
  buttonReleaseMs: number;
  /** Delay estimado (ms) entre RS abajo y el snap arriba, método rhythm. */
  rhythmWaitMs: number;
}

export interface BuildInput {
  /** Altura en pulgadas (69 = 5'9" ... 88 = 7'4"). */
  heightInches: number;
  /** Rating de triple (60-99). */
  threeRating: number;
  jumpshotId: string;
  /** Si el usuario ajusta la velocidad de release respecto a la base. */
  releaseSpeedOverride?: ReleaseSpeed;
}

export interface TimingResult {
  waitMs: number;
  jitterMs: number;
}

/** Botones PS4/PS5 asignables a funciones extra. */
export type AssignableButton =
  | "PS4_R3"
  | "PS4_L3"
  | "PS4_L1"
  | "PS4_R1"
  | "PS4_UP"
  | "PS4_RIGHT"
  | "PS4_LEFT";

export interface FeatureConfig {
  quickStop: boolean;
  meterDunk: boolean;
  oledMenu: boolean;
  killSwitch: boolean;
}

export interface ScriptConfig {
  build: BuildInput;
  method: ShotMethod;
  features: FeatureConfig;
  quickStopButton: AssignableButton;
  meterDunkButton: AssignableButton;
}
