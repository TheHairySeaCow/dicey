export const POINT_NUMBERS = [4, 5, 6, 8, 9, 10] as const;
export type Point = (typeof POINT_NUMBERS)[number];

export type LineSide = "pass" | "dont";

export type Mode = "earth" | "whiskey" | "dicey";

export type BetId =
  | "pass"
  | "dontPass"
  | "odds"
  | "lay"
  | "come"
  | "dontCome"
  | "place4"
  | "place5"
  | "place6"
  | "place8"
  | "place9"
  | "place10"
  | "field"
  | "big6"
  | "big8"
  | "hard4"
  | "hard6"
  | "hard8"
  | "hard10"
  | "any7"
  | "anyCraps"
  | "two"
  | "three"
  | "eleven"
  | "twelve"
  | "horn"
  | "ce";

export type ThrowSettle = (d1: number, d2: number, point: Point | null) => number;

export type BetDef = {
  id: BetId;
  label: string;
  short: string;
  /** Profit per 1 unit staked on a winning throw (e.g. 7/6 for place 6). */
  payMult: number;
  /** Chip multiple the casino expects. */
  chipMultiple: number;
  /** Relative size vs the table unit (odds are larger). */
  unitWeight: number;
  oneRoll: boolean;
  settle: ThrowSettle;
};

export type BetStats = {
  id: BetId;
  evPerThrow: number;
  varPerThrow: number;
  meanBank: number;
  sdBank: number;
  payMult: number;
};

export type SizedBet = {
  id: BetId;
  label: string;
  amount: number;
  payMult: number;
  meanBank: number;
  sdBank: number;
  promising: boolean;
  vibrancy: number;
  riskAlpha: number;
};

export type Recommendation = {
  point: Point | null;
  mode: Mode;
  promising: BetId[];
  unpromising: BetId[];
  combo: SizedBet[];
  ticketTotal: number;
  unit: number;
  fills: Record<BetId, SpotPaint>;
};

export type SpotPaint = {
  promising: boolean;
  fill: string;
  alpha: number;
  blend: "multiply" | "normal";
  amount: number | null;
  vibrancy: number;
};

export const ROLL_COUNT = 100_000;
export const STARTING_BANK = 1;
