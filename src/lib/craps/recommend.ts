import { ALL_BET_IDS, BETS, placeIdFor } from "./bets";
import { betStats, GLOBAL, isPromising } from "./simulate";
import type {
  BetId,
  LineSide,
  Mode,
  Point,
  Recommendation,
  SizedBet,
  SpotPaint,
} from "./types";

const DOLLAR_BILL = { r: 0x6b, g: 0x80, b: 0x68 };
const VELVET = { r: 0x7a, g: 0x1b, b: 0x2b };
const WASH = { r: 0x8a, g: 0x9e, b: 0x86 };

function hex({ r, g, b }: { r: number; g: number; b: number }) {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mix(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
  t: number,
) {
  const u = Math.min(1, Math.max(0, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * u),
    g: Math.round(a.g + (b.g - a.g) * u),
    b: Math.round(a.b + (b.b - a.b) * u),
  };
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

export function vibrancyForPay(payMult: number) {
  return clamp((payMult - 0.9) / 6, 0.42, 1);
}

export function riskAlpha(sdBank: number, meanBank: number) {
  const risk = clamp(sdBank / 2800, 0, 1);
  const drag = clamp(-meanBank / 14000, 0, 1);
  const t = Math.max(risk, drag * 0.55);
  return clamp(1 - 0.62 * t, 0.42, 1);
}

export function promisingFill(payMult: number) {
  const v = vibrancyForPay(payMult);
  // Washed dollar bill → full #6B8068 as payoff climbs.
  return hex(mix(WASH, DOLLAR_BILL, v));
}

export function velvetFill() {
  return hex(VELVET);
}

/** Proposition / dominated spots — always velvet once the puck is on. */
const SUCKER: BetId[] = [
  "any7",
  "anyCraps",
  "two",
  "three",
  "eleven",
  "twelve",
  "horn",
  "ce",
  "big6",
  "big8",
];

const PLACE_NUMS = [4, 5, 6, 8, 9, 10] as const;
const HARD_NUMS = [4, 6, 8, 10] as const;

function relevantBets(point: Point | null, line: LineSide): BetId[] {
  if (point == null) {
    return [line === "pass" ? "pass" : "dontPass", "field", ...SUCKER, "hard4", "hard6", "hard8", "hard10"];
  }
  const places = PLACE_NUMS.filter((n) => n !== point).map((n) => placeIdFor(n));
  const hards = HARD_NUMS.map((n) => `hard${n}` as BetId);
  if (line === "pass") {
    return ["pass", "odds", "come", ...places, "field", ...hards, ...SUCKER];
  }
  return ["dontPass", "lay", "dontCome", ...places, "field", ...hards, ...SUCKER];
}

function buildCombo(
  point: Point | null,
  line: LineSide,
  mode: Mode,
  promising: Set<BetId>,
): BetId[] {
  const take = (id: BetId) => promising.has(id);
  if (point == null) {
    return line === "pass" ? (take("pass") ? ["pass"] : []) : take("dontPass") ? ["dontPass"] : [];
  }

  const combo: BetId[] = [];
  if (line === "pass") {
    if (take("odds")) combo.push("odds");
    const sixEight = ([6, 8] as const)
      .filter((n) => n !== point)
      .map((n) => placeIdFor(n))
      .filter(take);
    combo.push(...sixEight);
    if (mode === "earth") {
      const inside = ([5, 9] as const)
        .filter((n) => n !== point)
        .map((n) => placeIdFor(n))
        .filter(take);
      combo.push(...inside);
    }
    if (mode === "dicey" && take("come") && combo.length < 3) combo.push("come");
    else if (mode === "whiskey" && take("come") && combo.length < 3) combo.push("come");
    if (mode === "dicey") {
      const spice = (`hard${point === 6 || point === 8 || point === 4 || point === 10 ? point : 6}`) as BetId;
      if (take(spice) && combo.length < 4) combo.push(spice);
    }
  } else {
    if (take("lay")) combo.push("lay");
    if (take("dontCome")) combo.push("dontCome");
  }
  return combo.slice(0, 4);
}

export function unitFromBank(bank: number, mode: Mode) {
  const frac = mode === "earth" ? 0.01 : mode === "whiskey" ? 0.02 : 0.045;
  const raw = Math.max(0, bank) * frac;
  if (raw < 0.5) return Math.max(1, Math.round(raw) || 1);
  if (raw < 5) return Math.max(1, Math.round(raw));
  if (raw < 20) return Math.round(raw);
  if (raw < 100) return Math.round(raw / 5) * 5;
  if (raw < 500) return Math.round(raw / 25) * 25;
  return Math.round(raw / 100) * 100;
}

function chipRound(amount: number, multiple: number) {
  if (amount <= 0) return 0;
  const m = Math.max(1, multiple);
  return Math.max(m, Math.round(amount / m) * m);
}

function oddsMultiple(point: Point, mode: Mode) {
  if (mode === "earth") return 2;
  if (point === 4 || point === 10) return 3;
  if (point === 5 || point === 9) return 4;
  return 5;
}

function layMultiple(point: Point) {
  if (point === 4 || point === 10) return 6;
  if (point === 5 || point === 9) return 6;
  return 5;
}

function sizeOne(id: BetId, unit: number, point: Point | null, mode: Mode, bank: number) {
  const def = BETS[id];
  let amount: number;
  if (id === "odds" && point) {
    const line = Math.max(1, unit);
    const mult = point === 6 || point === 8 ? 5 : 1;
    amount = chipRound(line * oddsMultiple(point, mode), point === 6 || point === 8 ? 5 : mult);
  } else if (id === "lay" && point) {
    amount = chipRound(unit * layMultiple(point), 1);
  } else {
    amount = chipRound(unit * def.unitWeight, def.chipMultiple);
  }
  amount = Math.min(amount, Math.max(0, Math.floor(bank)));
  if (amount <= 0 && bank >= 1) amount = Math.min(Math.max(1, def.chipMultiple), Math.floor(bank));
  return amount;
}

function capCombo(sized: SizedBet[], bank: number, mode: Mode) {
  const capFrac = mode === "earth" ? 0.18 : mode === "whiskey" ? 0.32 : 0.48;
  const cap = Math.max(1, Math.floor(bank * capFrac));
  const total = sized.reduce((a, b) => a + b.amount, 0);
  if (total <= cap || total <= 0) return sized;
  const scale = cap / total;
  return sized.map((b) => ({
    ...b,
    amount: Math.max(1, chipRound(b.amount * scale, BETS[b.id].chipMultiple)),
  }));
}

export function recommend(
  point: Point | null,
  mode: Mode,
  bank: number,
  line: LineSide,
): Recommendation {
  const relevant = relevantBets(point, line);
  const statsMap = new Map(relevant.map((id) => [id, betStats(id, point)] as const));
  const promising: BetId[] = [];
  const unpromising: BetId[] = [];
  for (const id of relevant) {
    const s = statsMap.get(id)!;
    const sucker = (SUCKER as string[]).includes(id);
    const ok = !sucker && isPromising(s, mode);
    if (ok) promising.push(id);
    else unpromising.push(id);
  }

  const promisingSet = new Set(promising);
  let best = buildCombo(point, line, mode, promisingSet);
  if (best.length === 0 && promising.length) best = promising.slice(0, 2);

  const unit = unitFromBank(bank, mode);
  let combo: SizedBet[] = best.map((id) => {
    const def = BETS[id];
    const s = statsMap.get(id) ?? betStats(id, point);
    return {
      id,
      label: def.label,
      amount: sizeOne(id, unit, point, mode, bank),
      payMult: def.payMult,
      meanBank: s.meanBank,
      sdBank: s.sdBank,
      promising: true,
      vibrancy: vibrancyForPay(def.payMult),
      riskAlpha: riskAlpha(s.sdBank, s.meanBank),
    };
  });
  combo = capCombo(combo, bank, mode);
  const ticketTotal = combo.reduce((a, b) => a + b.amount, 0);
  const comboAmounts = new Map(combo.map((c) => [c.id, c.amount]));
  const painted = point != null;

  const fills = {} as Record<BetId, SpotPaint>;
  for (const id of ALL_BET_IDS) {
    const def = BETS[id];
    const s = statsMap.get(id) ?? betStats(id, point);
    const ok = promisingSet.has(id);
    const inPlay = relevant.includes(id);
    if (!painted || !inPlay) {
      fills[id] = {
        promising: false,
        fill: "transparent",
        alpha: 0,
        blend: "normal",
        amount: null,
        vibrancy: 0,
      };
      continue;
    }
    fills[id] = {
      promising: ok,
      fill: ok ? promisingFill(def.payMult) : velvetFill(),
      alpha: ok ? riskAlpha(s.sdBank, s.meanBank) : 0.78,
      blend: "multiply",
      amount: comboAmounts.get(id) ?? null,
      vibrancy: vibrancyForPay(def.payMult),
    };
  }

  return {
    point,
    mode,
    promising,
    unpromising,
    combo,
    ticketTotal,
    unit,
    fills,
  };
}

export { GLOBAL };
