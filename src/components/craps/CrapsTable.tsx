import { useEffect, useState, type ReactNode } from "react";
import type { BetId, Point, SpotPaint } from "@/lib/craps/types";
import { POINT_NUMBERS } from "@/lib/craps/types";
import { formatDollars, useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

type Flash = { id: BetId; phase: "base" | "own" } | null;

export function CrapsTable() {
  const rec = useDicey((s) => s.rec);
  const point = useDicey((s) => s.point);
  const setPoint = useDicey((s) => s.setPoint);
  const [flash, setFlash] = useState<Flash>(null);
  const comboKey = rec.combo.map((c) => `${c.id}:${c.amount}`).join("-");

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFlash(null);
      return;
    }
    const ids = rec.combo.map((c) => c.id);
    if (!ids.length || rec.point == null) {
      setFlash(null);
      return;
    }
    let i = 0;
    let phase: "base" | "own" = "base";
    setFlash({ id: ids[0], phase: "base" });
    const t = window.setInterval(() => {
      if (phase === "base") {
        phase = "own";
        setFlash({ id: ids[i], phase: "own" });
      } else {
        i = (i + 1) % ids.length;
        phase = "base";
        setFlash({ id: ids[i], phase: "base" });
      }
    }, 500);
    return () => window.clearInterval(t);
  }, [comboKey, rec.point, rec.mode]);

  const paint = (id: BetId): SpotPaint => rec.fills[id];

  return (
    <div className="wood-rail rounded-rail p-2.5 sm:p-3.5">
      <div
        className="felt-cloth relative overflow-hidden rounded-lg ring-1 ring-ink/25"
        data-flash={flash ? `${flash.id}:${flash.phase}` : ""}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-rail-stitch/80" />

        {point != null && rec.ticketTotal > 0 ? (
          <div className="flex items-center justify-center gap-3 border-b border-felt-ink/30 px-3 py-2">
            <p className="font-table text-[0.62rem] tracking-[0.2em] text-felt-muted">BET THIS</p>
            <p className="font-display text-2xl tabular-nums leading-none text-ink">
              {formatDollars(rec.ticketTotal)}
            </p>
          </div>
        ) : (
          <div className="px-3 py-2 text-center">
            <p className="font-table text-[0.62rem] tracking-[0.18em] text-felt-muted">
              {point == null ? "Puck off · call the point" : `Point ${point}`}
            </p>
          </div>
        )}

        <div className="grid gap-0 px-2 pb-2 sm:px-2.5 sm:pb-2.5">
          <div className="grid grid-cols-2">
            <Spot
              id="dontCome"
              paint={paint("dontCome")}
              flash={flash}
              className="min-h-10 rounded-tl-sm border border-felt-ink sm:min-h-12"
            >
              <SpotLabel inverted={!paint("dontCome").promising && paint("dontCome").alpha > 0}>
                Don't Come
              </SpotLabel>
            </Spot>
            <Spot
              id="come"
              paint={paint("come")}
              flash={flash}
              className="min-h-10 rounded-tr-sm border border-l-0 border-felt-ink sm:min-h-12"
            >
              <SpotLabel inverted={!paint("come").promising && paint("come").alpha > 0}>Come</SpotLabel>
            </Spot>
          </div>

          <div className="grid grid-cols-6">
            {POINT_NUMBERS.map((n, i) => (
              <NumberBox
                key={n}
                n={n}
                active={point === n}
                paint={paint(`place${n}` as BetId)}
                flash={flash}
                edge={i === 0 ? "first" : i === 5 ? "last" : "mid"}
                onSelect={() => setPoint(n)}
              />
            ))}
          </div>

          <Spot
            id="dontPass"
            paint={paint("dontPass")}
            flash={flash}
            className="min-h-10 border-x border-b border-felt-ink sm:min-h-11"
          >
            <SpotLabel inverted={!paint("dontPass").promising && paint("dontPass").alpha > 0}>
              Don't Pass Bar
            </SpotLabel>
          </Spot>

          <Spot
            id="field"
            paint={paint("field")}
            flash={flash}
            className="min-h-14 border-x border-b border-felt-ink sm:min-h-[4.6rem]"
          >
            <div className="flex w-full flex-col items-center gap-1.5 py-1">
              <SpotLabel inverted={!paint("field").promising && paint("field").alpha > 0}>Field</SpotLabel>
              <div
                className={cn(
                  "flex w-full justify-between px-2 font-table text-[0.7rem] tracking-[0.14em] sm:text-xs",
                  paint("field").alpha > 0 && !paint("field").promising ? "text-felt" : "text-felt-ink",
                )}
              >
                <span>2 pays 2</span>
                <span>3 4 9 10 11</span>
                <span>12 pays 2</span>
              </div>
            </div>
          </Spot>

          <Spot
            id="pass"
            paint={paint("pass")}
            flash={flash}
            className="min-h-10 border-x border-b border-felt-ink sm:min-h-12"
          >
            <SpotLabel inverted={!paint("pass").promising && paint("pass").alpha > 0}>Pass Line</SpotLabel>
          </Spot>

          <div className="grid grid-cols-2">
            <Spot
              id="odds"
              paint={paint("odds")}
              flash={flash}
              className="min-h-10 border-x border-b border-felt-ink sm:min-h-11"
            >
              <SpotLabel inverted={!paint("odds").promising && paint("odds").alpha > 0}>Odds</SpotLabel>
            </Spot>
            <Spot
              id="lay"
              paint={paint("lay")}
              flash={flash}
              className="min-h-10 border-r border-b border-felt-ink sm:min-h-11"
            >
              <SpotLabel inverted={!paint("lay").promising && paint("lay").alpha > 0}>Lay</SpotLabel>
            </Spot>
          </div>

          <div className="grid grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)]">
            <div className="grid grid-rows-2 border-x border-b border-felt-ink">
              <Spot id="big6" paint={paint("big6")} flash={flash} className="min-h-10 border-b border-felt-ink sm:min-h-12">
                <SpotLabel inverted={!paint("big6").promising && paint("big6").alpha > 0}>Big 6</SpotLabel>
              </Spot>
              <Spot id="big8" paint={paint("big8")} flash={flash} className="min-h-10 sm:min-h-12">
                <SpotLabel inverted={!paint("big8").promising && paint("big8").alpha > 0}>Big 8</SpotLabel>
              </Spot>
            </div>
            <div className="border-r border-b border-felt-ink">
              <Spot id="any7" paint={paint("any7")} flash={flash} className="min-h-9 border-b border-felt-ink sm:min-h-10">
                <SpotLabel inverted={!paint("any7").promising && paint("any7").alpha > 0}>
                  Any Seven
                </SpotLabel>
              </Spot>
              <div className="grid grid-cols-4 border-b border-felt-ink">
                {([4, 6, 8, 10] as const).map((n, i) => (
                  <Spot
                    key={n}
                    id={`hard${n}` as BetId}
                    paint={paint(`hard${n}` as BetId)}
                    flash={flash}
                    className={cn("min-h-11 sm:min-h-[3.4rem]", i < 3 && "border-r border-felt-ink")}
                  >
                    <span className="flex flex-col items-center leading-none">
                      <span
                        className={cn(
                          "font-table text-[0.5rem] tracking-[0.16em]",
                          paint(`hard${n}` as BetId).alpha > 0 && !paint(`hard${n}` as BetId).promising
                            ? "text-felt"
                            : "text-felt-ink",
                        )}
                      >
                        HARD
                      </span>
                      <span
                        className={cn(
                          "font-table text-base",
                          paint(`hard${n}` as BetId).alpha > 0 && !paint(`hard${n}` as BetId).promising
                            ? "text-felt"
                            : "text-felt-ink",
                        )}
                      >
                        {n}
                      </span>
                    </span>
                  </Spot>
                ))}
              </div>
              <div className="grid grid-cols-3">
                {(
                  [
                    ["two", "2"],
                    ["three", "3"],
                    ["eleven", "11"],
                    ["twelve", "12"],
                    ["anyCraps", "CRAPS"],
                    ["ce", "C & E"],
                  ] as const
                ).map(([id, label], i) => (
                  <Spot
                    key={id}
                    id={id}
                    paint={paint(id)}
                    flash={flash}
                    className={cn(
                      "min-h-10 sm:min-h-11",
                      i % 3 !== 2 && "border-r border-felt-ink",
                      i < 3 && "border-b border-felt-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "font-table text-[0.65rem] tracking-wide",
                        paint(id).alpha > 0 && !paint(id).promising ? "text-felt" : "text-felt-ink",
                      )}
                    >
                      {label}
                    </span>
                  </Spot>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberBox({
  n,
  active,
  paint,
  flash,
  edge,
  onSelect,
}: {
  n: Point;
  active: boolean;
  paint: SpotPaint;
  flash: Flash;
  edge: "first" | "mid" | "last";
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} aria-label={`Set point ${n}`} className="relative block">
      <Spot
        id={`place${n}` as BetId}
        paint={paint}
        flash={flash}
        className={cn(
          "min-h-[3.75rem] border-b border-felt-ink sm:min-h-[4.6rem]",
          edge === "first" ? "border-x" : "border-r",
          active && "z-[1]",
        )}
      >
        <span className="flex flex-col items-center gap-1">
          {active ? (
            <span className="puck size-8 text-[0.5rem] tracking-[0.12em]">ON</span>
          ) : (
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border border-felt-ink/70 font-table text-lg leading-none",
                paint.alpha > 0 && !paint.promising ? "text-felt border-felt/50" : "text-felt-ink",
              )}
            >
              {n}
            </span>
          )}
        </span>
      </Spot>
    </button>
  );
}

function SpotLabel({ children, inverted }: { children: ReactNode; inverted?: boolean }) {
  return (
    <span
      className={cn(
        "font-table text-[0.62rem] tracking-[0.16em] uppercase sm:text-[0.7rem]",
        inverted ? "text-felt" : "text-felt-ink",
      )}
    >
      {children}
    </span>
  );
}

function Spot({
  id,
  paint,
  flash,
  className,
  children,
}: {
  id: BetId;
  paint: SpotPaint;
  flash: Flash;
  className?: string;
  children: ReactNode;
}) {
  const flashing = flash?.id === id;
  const live = paint.alpha > 0 && paint.fill !== "transparent";
  const useBase = flashing && flash.phase === "base";

  return (
    <div
      data-bet={id}
      className={cn("relative flex items-center justify-center px-1 py-1", live && "spot-paint", useBase && "spot-flash-base", className)}
    >
      {live && !useBase ? (
        <span
          aria-hidden="true"
          className="spot-paint pointer-events-none absolute inset-0"
          style={{
            backgroundColor: paint.fill,
            opacity: paint.alpha,
            mixBlendMode: paint.blend,
          }}
        />
      ) : null}
      <span className="relative z-[1] flex flex-col items-center justify-center gap-0.5">
        {children}
        {live && paint.amount != null && paint.amount > 0 && paint.promising ? (
          <span
            className={cn(
              "font-table text-[0.62rem] tabular-nums tracking-wide",
              "text-felt-ink",
            )}
          >
            ${paint.amount}
          </span>
        ) : null}
      </span>
    </div>
  );
}
