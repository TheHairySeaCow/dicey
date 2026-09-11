import { create } from "zustand";
import { persist } from "zustand/middleware";
import { recommend } from "@/lib/craps/recommend";
import type { LineSide, Mode, Point, Recommendation } from "@/lib/craps/types";

type DiceyState = {
  bank: number;
  bankConfirmed: boolean;
  mode: Mode;
  line: LineSide;
  point: Point | null;
  unitScale: number;
  rec: Recommendation;
  reminder: string | null;
  listening: boolean;
  voiceStatus: string | null;
  editorOpen: boolean;
  setBank: (n: number) => void;
  confirmBank: () => void;
  setMode: (m: Mode) => void;
  setLine: (l: LineSide) => void;
  setPoint: (p: Point | null) => void;
  bumpUnit: (dir: 1 | -1) => void;
  setListening: (v: boolean) => void;
  setVoiceStatus: (s: string | null) => void;
  setEditorOpen: (v: boolean) => void;
  dismissReminder: () => void;
  pingReminder: () => void;
};

function buildRec(
  point: Point | null,
  mode: Mode,
  bank: number,
  line: LineSide,
  unitScale: number,
): Recommendation {
  const rec = recommend(point, mode, bank, line);
  if (unitScale === 1) return rec;
  const combo = rec.combo.map((c) => ({
    ...c,
    amount: Math.max(1, Math.round(c.amount * unitScale)),
  }));
  const ticketTotal = combo.reduce((a, b) => a + b.amount, 0);
  const amounts = new Map(combo.map((c) => [c.id, c.amount]));
  const fills = { ...rec.fills };
  for (const id of Object.keys(fills) as (keyof typeof fills)[]) {
    const paint = fills[id];
    if (paint.amount != null && amounts.has(id)) {
      fills[id] = { ...paint, amount: amounts.get(id)! };
    }
  }
  return { ...rec, combo, ticketTotal, unit: rec.unit * unitScale, fills };
}

export const useDicey = create<DiceyState>()(
  persist(
    (set, get) => ({
      bank: 1,
      bankConfirmed: false,
      mode: "whiskey",
      line: "pass",
      point: null,
      unitScale: 1,
      rec: buildRec(null, "whiskey", 1, "pass", 1),
      reminder: null,
      listening: false,
      voiceStatus: null,
      editorOpen: false,
      setBank: (n) => {
        const bank = Math.max(0, Math.round(n));
        const s = get();
        set({
          bank,
          rec: buildRec(s.point, s.mode, bank, s.line, s.unitScale),
          reminder: null,
        });
      },
      confirmBank: () => set({ bankConfirmed: true, editorOpen: false }),
      setMode: (mode) => {
        const s = get();
        set({ mode, rec: buildRec(s.point, mode, s.bank, s.line, s.unitScale) });
      },
      setLine: (line) => {
        const s = get();
        set({ line, rec: buildRec(s.point, s.mode, s.bank, line, s.unitScale) });
      },
      setPoint: (point) => {
        const s = get();
        set({
          point,
          rec: buildRec(point, s.mode, s.bank, s.line, s.unitScale),
          voiceStatus: null,
        });
      },
      bumpUnit: (dir) => {
        const s = get();
        const unitScale = Math.min(4, Math.max(0.5, Number((s.unitScale + dir * 0.25).toFixed(2))));
        set({ unitScale, rec: buildRec(s.point, s.mode, s.bank, s.line, unitScale) });
      },
      setListening: (listening) => set({ listening }),
      setVoiceStatus: (voiceStatus) => set({ voiceStatus }),
      setEditorOpen: (editorOpen) => set({ editorOpen }),
      dismissReminder: () => set({ reminder: null }),
      pingReminder: () => {
        const { bank, point } = get();
        if (point == null) return;
        set({
          reminder: `Bank still ${formatDollars(bank)} — tap the flaps if you pressed or pulled.`,
        });
      },
    }),
    {
      name: "dicey-craps-v1",
      partialize: (s) => ({
        bank: s.bank,
        bankConfirmed: s.bankConfirmed,
        mode: s.mode,
        line: s.line,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        state.rec = buildRec(state.point, state.mode, state.bank, state.line, state.unitScale);
      },
    },
  ),
);

export function formatDollars(n: number) {
  if (!Number.isFinite(n)) return "$0";
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
