import { BETS } from "./bets";
import {
  ROLL_COUNT,
  STARTING_BANK,
  type BetId,
  type BetStats,
  type Point,
} from "./types";

/** Exact mean/variance of one throw, scaled to 100,000 independent rolls. */
export function statsForSettle(
  settle: (d1: number, d2: number, point: Point | null) => number,
  point: Point | null,
): { evPerThrow: number; varPerThrow: number; meanBank: number; sdBank: number } {
  let sum = 0;
  let sumSq = 0;
  for (let d1 = 1; d1 <= 6; d1++) {
    for (let d2 = 1; d2 <= 6; d2++) {
      const r = settle(d1, d2, point);
      sum += r;
      sumSq += r * r;
    }
  }
  const ev = sum / 36;
  const second = sumSq / 36;
  const variance = Math.max(0, second - ev * ev);
  return {
    evPerThrow: ev,
    varPerThrow: variance,
    meanBank: STARTING_BANK + ROLL_COUNT * ev,
    sdBank: Math.sqrt(ROLL_COUNT * variance),
  };
}

function statsForCombo(ids: BetId[], point: Point | null) {
  return statsForSettle((d1, d2, p) => {
    let pnl = 0;
    for (const id of ids) {
      pnl += BETS[id].settle(d1, d2, p);
    }
    return pnl;
  }, point);
}

const SAMPLE_POINTS: Point[] = [4, 5, 6, 8, 9, 10];

function populationBanks(): number[] {
  const banks: number[] = [];
  // Come-out individual bets
  for (const def of Object.values(BETS)) {
    banks.push(statsForSettle(def.settle, null).meanBank);
  }
  // Point-on, each number, each bet
  for (const point of SAMPLE_POINTS) {
    for (const def of Object.values(BETS)) {
      banks.push(statsForSettle(def.settle, point).meanBank);
    }
    // Representative combinations and unit sizes (1–3 units on the combo)
    const sixEight = (["place6", "place8"] as BetId[]).filter(
      (id) => id !== `place${point}`,
    );
    const recipes: BetId[][] = [
      ["odds"],
      ["lay"],
      sixEight,
      ["odds", ...sixEight],
      ["field"],
      ["come"],
      ["pass"],
      ["dontPass"],
      ["any7"],
      ["hard6", "hard8"],
      ["field", "place5", "place6", "place8"].filter(
        (id) => id !== `place${point}`,
      ) as BetId[],
    ];
    for (const recipe of recipes) {
      if (recipe.length === 0) continue;
      const s = statsForCombo(recipe, point);
      banks.push(s.meanBank);
    }
  }
  return banks;
}

function mean(xs: number[]) {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function stdev(xs: number[], m: number) {
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / xs.length;
  return Math.sqrt(v);
}

const POPULATION = populationBanks();
const POP_MEAN = mean(POPULATION);
const POP_SD = stdev(POPULATION, POP_MEAN);

export const GLOBAL = {
  mean: POP_MEAN,
  sd: POP_SD,
  earthThreshold: POP_MEAN - 0.5 * POP_SD,
  whiskeyThreshold: POP_MEAN,
  diceyGreen: POP_MEAN,
};

export function betStats(id: BetId, point: Point | null): BetStats {
  const def = BETS[id];
  const s = statsForSettle(def.settle, point);
  return { id, payMult: def.payMult, ...s };
}

export function comboStats(ids: BetId[], point: Point | null) {
  return statsForCombo(ids, point);
}

export function isPromising(
  stats: { meanBank: number; sdBank: number },
  mode: "earth" | "whiskey" | "dicey",
) {
  if (mode === "earth") return stats.meanBank >= GLOBAL.earthThreshold;
  if (mode === "whiskey") return stats.meanBank >= GLOBAL.whiskeyThreshold;
  // Dicey: lights up if the bet's own upside (mean + ½ SD) reaches above the green line.
  return stats.meanBank + 0.5 * stats.sdBank >= GLOBAL.diceyGreen;
}
