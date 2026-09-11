import type { BetDef, BetId, Point } from "./types";

export const WAYS: Record<number, number> = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

function total(d1: number, d2: number) {
  return d1 + d2;
}

function isHard(d1: number, d2: number) {
  return d1 === d2;
}

function placeSettle(target: number, pay: number) {
  return (d1: number, d2: number) => {
    const t = total(d1, d2);
    if (t === target) return pay;
    if (t === 7) return -1;
    return 0;
  };
}

function oddsSettle(point: Point) {
  const pay: Record<Point, number> = {
    4: 2,
    5: 1.5,
    6: 1.2,
    8: 1.2,
    9: 1.5,
    10: 2,
  };
  return (d1: number, d2: number, p: Point | null) => {
    const pt = p ?? point;
    const t = total(d1, d2);
    if (t === pt) return pay[pt];
    if (t === 7) return -1;
    return 0;
  };
}

function laySettle(point: Point) {
  // Lay pays the inverse of true odds: win 1 at 4/10 to risk 2, etc.
  const pay: Record<Point, number> = {
    4: 0.5,
    5: 2 / 3,
    6: 5 / 6,
    8: 5 / 6,
    9: 2 / 3,
    10: 0.5,
  };
  return (d1: number, d2: number, p: Point | null) => {
    const pt = p ?? point;
    const t = total(d1, d2);
    if (t === 7) return pay[pt];
    if (t === pt) return -1;
    return 0;
  };
}

function hardSettle(target: number, pay: number) {
  return (d1: number, d2: number) => {
    const t = total(d1, d2);
    if (t === target && isHard(d1, d2)) return pay;
    if (t === target || t === 7) return -1;
    return 0;
  };
}

export const BETS: Record<BetId, BetDef> = {
  pass: {
    id: "pass",
    label: "Pass Line",
    short: "PASS",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: (d1, d2, point) => {
      const t = total(d1, d2);
      if (point == null) {
        if (t === 7 || t === 11) return 1;
        if (t === 2 || t === 3 || t === 12) return -1;
        return 0;
      }
      if (t === point) return 1;
      if (t === 7) return -1;
      return 0;
    },
  },
  dontPass: {
    id: "dontPass",
    label: "Don't Pass",
    short: "DON'T PASS",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: (d1, d2, point) => {
      const t = total(d1, d2);
      if (point == null) {
        if (t === 2 || t === 3) return 1;
        if (t === 7 || t === 11) return -1;
        // 12 is a push on don't pass
        return 0;
      }
      if (t === 7) return 1;
      if (t === point) return -1;
      return 0;
    },
  },
  odds: {
    id: "odds",
    label: "Pass Odds",
    short: "ODDS",
    payMult: 1.2,
    chipMultiple: 1,
    unitWeight: 3,
    oneRoll: false,
    settle: oddsSettle(6),
  },
  lay: {
    id: "lay",
    label: "Lay Odds",
    short: "LAY",
    payMult: 0.5,
    chipMultiple: 1,
    unitWeight: 4,
    oneRoll: false,
    settle: laySettle(6),
  },
  come: {
    id: "come",
    label: "Come",
    short: "COME",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      if (t === 7 || t === 11) return 1;
      if (t === 2 || t === 3 || t === 12) return -1;
      return 0;
    },
  },
  dontCome: {
    id: "dontCome",
    label: "Don't Come",
    short: "DON'T COME",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      if (t === 2 || t === 3) return 1;
      if (t === 7 || t === 11) return -1;
      return 0;
    },
  },
  place4: {
    id: "place4",
    label: "Place 4",
    short: "4",
    payMult: 9 / 5,
    chipMultiple: 5,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(4, 9 / 5),
  },
  place5: {
    id: "place5",
    label: "Place 5",
    short: "5",
    payMult: 7 / 5,
    chipMultiple: 5,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(5, 7 / 5),
  },
  place6: {
    id: "place6",
    label: "Place 6",
    short: "6",
    payMult: 7 / 6,
    chipMultiple: 6,
    unitWeight: 1.2,
    oneRoll: false,
    settle: placeSettle(6, 7 / 6),
  },
  place8: {
    id: "place8",
    label: "Place 8",
    short: "8",
    payMult: 7 / 6,
    chipMultiple: 6,
    unitWeight: 1.2,
    oneRoll: false,
    settle: placeSettle(8, 7 / 6),
  },
  place9: {
    id: "place9",
    label: "Place 9",
    short: "9",
    payMult: 7 / 5,
    chipMultiple: 5,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(9, 7 / 5),
  },
  place10: {
    id: "place10",
    label: "Place 10",
    short: "10",
    payMult: 9 / 5,
    chipMultiple: 5,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(10, 9 / 5),
  },
  field: {
    id: "field",
    label: "Field",
    short: "FIELD",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      if (t === 2 || t === 12) return 2;
      if (t === 3 || t === 4 || t === 9 || t === 10 || t === 11) return 1;
      return -1;
    },
  },
  big6: {
    id: "big6",
    label: "Big 6",
    short: "BIG 6",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(6, 1),
  },
  big8: {
    id: "big8",
    label: "Big 8",
    short: "BIG 8",
    payMult: 1,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: placeSettle(8, 1),
  },
  hard4: {
    id: "hard4",
    label: "Hard 4",
    short: "HARD 4",
    payMult: 7,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: hardSettle(4, 7),
  },
  hard6: {
    id: "hard6",
    label: "Hard 6",
    short: "HARD 6",
    payMult: 9,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: hardSettle(6, 9),
  },
  hard8: {
    id: "hard8",
    label: "Hard 8",
    short: "HARD 8",
    payMult: 9,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: hardSettle(8, 9),
  },
  hard10: {
    id: "hard10",
    label: "Hard 10",
    short: "HARD 10",
    payMult: 7,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: false,
    settle: hardSettle(10, 7),
  },
  any7: {
    id: "any7",
    label: "Any Seven",
    short: "ANY 7",
    payMult: 4,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => (total(d1, d2) === 7 ? 4 : -1),
  },
  anyCraps: {
    id: "anyCraps",
    label: "Any Craps",
    short: "CRAPS",
    payMult: 7,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      return t === 2 || t === 3 || t === 12 ? 7 : -1;
    },
  },
  two: {
    id: "two",
    label: "Aces",
    short: "2",
    payMult: 30,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => (total(d1, d2) === 2 ? 30 : -1),
  },
  three: {
    id: "three",
    label: "Ace Deuce",
    short: "3",
    payMult: 15,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => (total(d1, d2) === 3 ? 15 : -1),
  },
  eleven: {
    id: "eleven",
    label: "Yo",
    short: "11",
    payMult: 15,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => (total(d1, d2) === 11 ? 15 : -1),
  },
  twelve: {
    id: "twelve",
    label: "Boxcars",
    short: "12",
    payMult: 30,
    chipMultiple: 1,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => (total(d1, d2) === 12 ? 30 : -1),
  },
  horn: {
    id: "horn",
    label: "Horn",
    short: "HORN",
    payMult: 7.5,
    chipMultiple: 4,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      // $4 horn: $1 each on 2, 3, 11, 12. Return is net on the $4.
      if (t === 2 || t === 12) return (30 - 3) / 4;
      if (t === 3 || t === 11) return (15 - 3) / 4;
      return -1;
    },
  },
  ce: {
    id: "ce",
    label: "C & E",
    short: "C & E",
    payMult: 3.5,
    chipMultiple: 2,
    unitWeight: 1,
    oneRoll: true,
    settle: (d1, d2) => {
      const t = total(d1, d2);
      // $2 C&E: $1 any craps + $1 yo
      if (t === 11) return (15 - 1) / 2;
      if (t === 2 || t === 3 || t === 12) return (7 - 1) / 2;
      return -1;
    },
  },
};

export const ALL_BET_IDS = Object.keys(BETS) as BetId[];

export function placeIdFor(n: 4 | 5 | 6 | 8 | 9 | 10): BetId {
  return `place${n}` as BetId;
}

export function hardIdFor(n: 4 | 6 | 8 | 10): BetId {
  return `hard${n}` as BetId;
}
