// Sanity checks for the panel-care estimator. Run: npx rolldown scripts/soiling-check.ts --file <out>.mjs --format esm --platform node && node <out>.mjs
import { estimate, GRID_CO2, LOSS_CAP, SPECIFIC_YIELD } from '../src/engine/soiling'

let failed = 0
const check = (name: string, cond: boolean, detail = '') => {
  if (!cond) failed++
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  ' + detail : ''}`)
}
const near = (a: number, b: number, eps = 1e-6) => Math.abs(a - b) < eps

// 5 kWp home system, desert rate 0.3 %/day, 14 days dirty
const r = estimate({ kwp: 5, days: 14, rate: 0.3, threshold: 5 })
check('clean output = yield x kWp', near(r.dailyKwh, 5 * SPECIFIC_YIELD), r.dailyKwh.toFixed(2))
check('loss after 14 days = 4.2 %', near(r.loss, 4.2), r.loss.toFixed(2))
// sum_{d=1..14} 0.3*d % of 25.85 kWh = 0.3*105 % * 25.85
check('energy lost so far', near(r.lostSoFar, (25.85 * 0.3 * 105) / 100, 1e-6), r.lostSoFar.toFixed(2) + ' kWh')
check('CO2 uses the grid factor', near(r.co2SoFar, r.lostSoFar * GRID_CO2), r.co2SoFar.toFixed(2) + ' kg')
check('days to 5 % threshold = 3', r.daysToThreshold === 3, String(r.daysToThreshold))
check('suggested interval = 17 days', r.interval === 17, String(r.interval))
// cleaning today saves 30 days x 14 days of accumulated loss offset: 0.3*14 % per day * 30 days * 25.85
check('saving from cleaning today', near(r.savedIfCleanNow, (25.85 * 0.3 * 14 * 30) / 100, 1e-6), r.savedIfCleanNow.toFixed(2) + ' kWh')

// freshly cleaned: nothing lost, nothing to save
const z = estimate({ kwp: 5, days: 0, rate: 0.3, threshold: 5 })
check('day 0 has no loss', z.loss === 0 && z.lostSoFar === 0 && z.savedIfCleanNow === 0)

// heavy coating caps at LOSS_CAP
const c = estimate({ kwp: 1, days: 400, rate: 1, threshold: 5 })
check('loss is capped', c.loss === LOSS_CAP, String(c.loss))
check('past threshold means clean now', c.daysToThreshold === 0)

// zero rate never needs cleaning
const n = estimate({ kwp: 1, days: 10, rate: 0, threshold: 5 })
check('zero rate gives infinite interval', n.interval === Infinity && n.loss === 0)

console.log(failed ? `\n${failed} FAILED` : '\nall checks passed')
if (failed) process.exit(1)
