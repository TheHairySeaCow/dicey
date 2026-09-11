import { useEffect } from "react";
import { BankEditor } from "@/components/craps/BankEditor";
import { BetTicket } from "@/components/craps/BetTicket";
import { CrapsTable } from "@/components/craps/CrapsTable";
import { DiceyMark } from "@/components/craps/DiceyMark";
import { FlipBank } from "@/components/craps/FlipBank";
import { ModeSwitch } from "@/components/craps/ModeSwitch";
import { NumberPad } from "@/components/craps/NumberPad";
import { VoiceButton } from "@/components/craps/VoiceButton";
import { POINT_NUMBERS, type Point } from "@/lib/craps/types";
import { useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppShell() {
  const line = useDicey((s) => s.line);
  const setLine = useDicey((s) => s.setLine);
  const setPoint = useDicey((s) => s.setPoint);
  const pingReminder = useDicey((s) => s.pingReminder);
  const bankConfirmed = useDicey((s) => s.bankConfirmed);
  const setEditorOpen = useDicey((s) => s.setEditorOpen);
  const point = useDicey((s) => s.point);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "0") {
        setPoint(10);
        return;
      }
      const n = Number(e.key);
      if ((POINT_NUMBERS as readonly number[]).includes(n)) setPoint(n as Point);
      if (e.key === "Escape" || e.key === "c" || e.key === "C") setPoint(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setPoint]);

  useEffect(() => {
    if (point == null) return;
    const t = window.setInterval(() => pingReminder(), 28000);
    const first = window.setTimeout(() => pingReminder(), 12000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(first);
    };
  }, [point, pingReminder]);

  return (
    <main className="mx-auto flex h-dvh max-w-md flex-col overflow-hidden">
      <header className="flex shrink-0 items-center justify-between gap-3 px-3 pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="flex min-w-0 items-center gap-2">
          <DiceyMark className="size-11" />
          <div className="min-w-0">
            <p className="font-table text-[0.58rem] tracking-[0.28em] text-felt-muted">
              TABLE ADVISOR
            </p>
            <h1 className="font-display text-[1.85rem] leading-none tracking-tight text-ink">
              Dicey
            </h1>
          </div>
        </div>
        <FlipBank compact />
      </header>

      <div className="flex shrink-0 flex-col gap-2 px-3">
        <ModeSwitch />
        <div className="flex gap-1 rounded-md bg-ink/6 p-1">
          {(["pass", "dont"] as const).map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => setLine(side)}
              className={cn(
                "min-h-11 flex-1 rounded-sm font-table text-xs tracking-[0.16em] uppercase transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                line === side ? "bg-walnut text-felt" : "text-felt-muted hover:text-felt-ink",
              )}
            >
              {side === "pass" ? "Pass" : "Don't"}
            </button>
          ))}
        </div>
        {!bankConfirmed ? (
          <button
            type="button"
            onClick={() => setEditorOpen(true)}
            className="ticket-card rounded-md px-3 py-2 text-left text-sm text-felt-ink"
          >
            Set the bank on the flaps before you start.
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-2">
        <CrapsTable />
        <div className="mt-2">
          <BetTicket />
        </div>
      </div>

      <div className="shrink-0 border-t border-ink/10 bg-felt px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <NumberPad />
          </div>
          <VoiceButton className="size-14 rounded-lg" />
        </div>
      </div>

      <BankEditor />
    </main>
  );
}
