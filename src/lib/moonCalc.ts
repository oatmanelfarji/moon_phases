/**
 * Moon phase calculation — direct port of Drupal moon_phases MoonCalc.
 *
 * Algorithm (USNO-based approximation from the original module):
 * - Lunation period: 29.53058867 days (2551442.86108 seconds)
 * - Base epoch: a known full moon, 2008-12-12 16:37 UTC
 * - Position in cycle: ((date - base) mod period) / period, in [0, 1)
 * - Phase id: position mapped through the original module's thresholds
 * - Illumination: (1 + cos(2 * PI * position)) / 2
 */

export const PERIOD_IN_DAYS = 29.53058867;
export const PERIOD_IN_SECONDS = 2551442.86108;

/** Known full moon used as the cycle epoch. */
export const BASE_FULL_MOON_MS = Date.UTC(2008, 11, 12, 16, 37, 0);

export const PHASE_NAMES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;

export type PhaseName = (typeof PHASE_NAMES)[number];

/** Config keys matching the original Drupal settings keys. */
export const PHASE_KEYS = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

export const PHASE_NAME_TO_KEY: Record<PhaseName, PhaseKey> = {
  "New Moon": "new_moon",
  "Waxing Crescent": "waxing_crescent",
  "First Quarter": "first_quarter",
  "Waxing Gibbous": "waxing_gibbous",
  "Full Moon": "full_moon",
  "Waning Gibbous": "waning_gibbous",
  "Last Quarter": "last_quarter",
  "Waning Crescent": "waning_crescent",
};

export type MoonPhaseType = "New Moon" | "First Quarter" | "Full Moon" | "Last Quarter";

const DELIMITERS: Record<MoonPhaseType, number> = {
  "Last Quarter": 0.25,
  "New Moon": 0.5,
  "First Quarter": 0.75,
  "Full Moon": 1,
};

/**
 * Position in the lunation cycle, in [0, 1).
 * 0 = full moon, ~0.5 = new moon.
 */
export function getPositionInCycle(date: Date): number {
  const diffSeconds = (date.getTime() - BASE_FULL_MOON_MS) / 1000;
  let position = (diffSeconds % PERIOD_IN_SECONDS) / PERIOD_IN_SECONDS;
  if (position < 0) {
    position += 1;
  }
  return position;
}

/** Phase id for a cycle position, using the original module's thresholds. */
export function getPhaseId(position: number): number {
  if (position >= 0.474 && position <= 0.53) return 0;
  if (position >= 0.54 && position <= 0.724) return 1;
  if (position >= 0.725 && position <= 0.776) return 2;
  if (position >= 0.777 && position <= 0.974) return 3;
  if (position >= 0.975 || position <= 0.026) return 4;
  if (position >= 0.027 && position <= 0.234) return 5;
  if (position >= 0.235 && position <= 0.295) return 6;
  return 7;
}

export function getMoonPhaseName(date: Date): PhaseName {
  return PHASE_NAMES[getPhaseId(getPositionInCycle(date))];
}

/** Percentage of illumination, 0–100, rounded to 2 decimals. */
export function getPercentOfIllumination(date: Date): number {
  const position = getPositionInCycle(date);
  const percentage = ((1.0 + Math.cos(2.0 * Math.PI * position)) / 2.0) * 100;
  return Math.round(percentage * 100) / 100;
}

/** Days until the next occurrence of a major phase. */
export function getDaysUntilNextMoonType(date: Date, type: MoonPhaseType): number {
  const delimiter = DELIMITERS[type];
  if (delimiter === undefined) {
    throw new Error(`Unknown moon phase type: ${type}`);
  }
  const precision = delimiter === 1 ? 2 : 1;
  const position = getPositionInCycle(date);
  let days: number;
  if (position < delimiter) {
    days = (delimiter - position) * PERIOD_IN_DAYS;
  } else {
    days = (delimiter + 1 - position) * PERIOD_IN_DAYS;
  }
  return roundTo(days, precision);
}

/**
 * Static asset path for a phase image.
 * Image index = round(position * 100), 100 wraps to 00 (as in the original).
 */
export function getImageSrc(date: Date): string {
  const position = getPositionInCycle(date);
  let index = Math.round(position * 100);
  if (index > 99) {
    index = 0;
  }
  return `/images/moon.${index.toString().padStart(2, "0")}.png`;
}

/** Convenience snapshot of everything a view needs for one date. */
export interface MoonSnapshot {
  position: number;
  phaseId: number;
  phaseName: PhaseName;
  phaseKey: PhaseKey;
  illumination: number;
  imageSrc: string;
  daysUntil: Record<MoonPhaseType, number>;
}

export function getMoonSnapshot(date: Date): MoonSnapshot {
  const phaseName = getMoonPhaseName(date);
  return {
    position: getPositionInCycle(date),
    phaseId: getPhaseId(getPositionInCycle(date)),
    phaseName,
    phaseKey: PHASE_NAME_TO_KEY[phaseName],
    illumination: getPercentOfIllumination(date),
    imageSrc: getImageSrc(date),
    daysUntil: {
      "New Moon": getDaysUntilNextMoonType(date, "New Moon"),
      "First Quarter": getDaysUntilNextMoonType(date, "First Quarter"),
      "Full Moon": getDaysUntilNextMoonType(date, "Full Moon"),
      "Last Quarter": getDaysUntilNextMoonType(date, "Last Quarter"),
    },
  };
}

function roundTo(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
