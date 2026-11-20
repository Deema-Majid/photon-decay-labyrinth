/**
 * Panel-care estimator: turns the game's three soiling environments into a practical
 * estimate for a real rooftop or school system.
 *
 * Model: soiling loss grows linearly with days since the last cleaning (a common first
 * approximation in field studies) and is capped. All constants are published averages and
 * every number shown to the player is labelled as an estimate.
 */

export type Environment = 'desert' | 'coast' | 'city'

/**
 * Daily soiling-loss rates in % of output per day.
 * desert: K.A.CARE three-year campaign at Rumah measured 3–10 % per month (~0.1–0.33 %/day);
 *         reviews of Saudi/Qatari sites cite up to 0.5–1 %/day in dusty seasons.
 * coast:  a 30-day study in Rabigh measured 2–18 % across technologies (~0.07–0.6 %/day).
 * city:   no Saudi-specific measurement found; a conservative assumption the player can change.
 */
export const PRESETS: Record<Environment, { rate: number; range: [number, number]; measured: boolean }> = {
  desert: { rate: 0.3, range: [0.1, 1.0], measured: true },
  coast: { rate: 0.4, range: [0.07, 0.6], measured: true },
  city: { rate: 0.2, range: [0.05, 0.5], measured: false },
}

/** Global Solar Atlas, Saudi Arabia average PV output: 5.17 kWh per kWp per day. */
export const SPECIFIC_YIELD = 5.17
/** Ember 2024 grid average for Saudi Arabia: 0.692 kg CO2 per kWh. */
export const GRID_CO2 = 0.692
/** Losses stop growing linearly once panels are heavily coated. */
export const LOSS_CAP = 30

export interface SoilingInput {
  /** installed capacity in kWp */
  kwp: number
  /** days since the last cleaning */
  days: number
  /** soiling rate, % per day */
  rate: number
  /** clean once the loss reaches this %, default 5 */
  threshold: number
}

export interface SoilingResult {
  /** current output loss in % */
  loss: number
  /** clean-panel output per day, kWh */
  dailyKwh: number
  /** energy lost today, kWh */
  dailyLost: number
  /** energy lost since the last cleaning, kWh */
  lostSoFar: number
  co2SoFar: number
  /** energy recovered over the next 30 days by cleaning today instead of waiting */
  savedIfCleanNow: number
  co2Saved: number
  /** days until the loss reaches the threshold (0 = now) */
  daysToThreshold: number
  /** suggested cleaning interval in days */
  interval: number
}

const lossAt = (rate: number, day: number) => Math.min(LOSS_CAP, Math.max(0, rate * day))

export function estimate(input: SoilingInput): SoilingResult {
  const kwp = Math.max(0, input.kwp)
  const days = Math.max(0, Math.round(input.days))
  const rate = Math.max(0, input.rate)
  const threshold = Math.max(0.5, input.threshold)
  const dailyKwh = SPECIFIC_YIELD * kwp

  let lostSoFar = 0
  for (let d = 1; d <= days; d++) lostSoFar += (dailyKwh * lossAt(rate, d)) / 100

  let dirty = 0
  let clean = 0
  for (let k = 1; k <= 30; k++) {
    dirty += (dailyKwh * lossAt(rate, days + k)) / 100
    clean += (dailyKwh * lossAt(rate, k)) / 100
  }
  const savedIfCleanNow = Math.max(0, dirty - clean)

  const loss = lossAt(rate, days)
  return {
    loss,
    dailyKwh,
    dailyLost: (dailyKwh * loss) / 100,
    lostSoFar,
    co2SoFar: lostSoFar * GRID_CO2,
    savedIfCleanNow,
    co2Saved: savedIfCleanNow * GRID_CO2,
    daysToThreshold: rate > 0 ? Math.max(0, Math.ceil(threshold / rate - days)) : Infinity,
    interval: rate > 0 ? Math.max(1, Math.round(threshold / rate)) : Infinity,
  }
}
