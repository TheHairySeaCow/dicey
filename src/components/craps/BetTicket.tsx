import { Minus, Plus } from "lucide-react";
import { formatDollars, useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

export function BetTicket() {
  const rec = useDicey((s) => s.rec);
  const point = useDicey((s) => s.point);
  const bumpUnit = useDicey((s) => s.bumpUnit);
  const unitScale = useDicey((s) => s.unitScale);
  const mode = useDicey((s) => s.mode);
  const reminder = useDicey((s) => s.reminder);
  const dismissReminder = useDicey((s) => s.dismissReminder);
  const voiceStatus = useDicey((s) => s.voiceStatus);

  const modeLabel =
    mode === "earth" ? "Earth Tone" : mode === "dicey" ? "Dicey" : "Whiskey";

  return (
    <section className="ticket-card rounded-lg p-3 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-table text-[0.62rem] tracking-[0.2em] text-felt-muted">
            {point == null ? "COME-OUT" : `POINT ${point}`} · {modeLabel.toUpperCase()}
          </p>
          <h2 className="mt-1 font-display text-2xl leading-none text-ink">
            {point == null
              ? rec.ticketTotal > 0
                ? `Bet the line ${formatDollars(rec.ticketTotal)}`
                : "Bet the line"
              : rec.ticketTotal > 0
                ? `Bet this ${formatDollars(rec.ticketTotal)}`
                : "Bet this"}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Smaller unit"
            onClick={() => bumpUnit(-1)}
            className="flex size-11 items-center justify-center rounded-sm bg-ink/6 text-felt-ink transition-transform duration-150 active:scale-[0.96]"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center font-table text-xs tabular-nums text-felt-muted">
            ×{unitScale.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")}
          </span>
          <button
            type="button"
            aria-label="Larger unit"
            onClick={() => bumpUnit(1)}
            className="flex size-11 items-center justify-center rounded-sm bg-ink/6 text-felt-ink transition-transform duration-150 active:scale-[0.96]"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {rec.combo.length ? (
        <ul className="mt-3 divide-y divide-ink/8">
          {rec.combo.map((bet) => (
            <li key={bet.id} className="flex items-baseline justify-between py-1.5">
              <span className="text-sm text-felt-ink">{bet.label}</span>
              <span className="font-table text-sm tabular-nums tracking-wide text-ink">
                {formatDollars(bet.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-felt-muted">
          Call the point — speak it or tap a number — and Dicey paints the layout.
        </p>
      )}

      {voiceStatus ? (
        <p className="mt-2 text-sm text-dollar-bill-deep">{voiceStatus}</p>
      ) : null}

      {reminder ? (
        <button
          type="button"
          onClick={dismissReminder}
          className={cn(
            "mt-3 w-full rounded-sm bg-ink/5 px-3 py-2 text-left text-xs text-felt-muted transition-opacity duration-150 hover:text-felt-ink",
          )}
        >
          {reminder}
        </button>
      ) : (
        <p className="mt-3 text-xs text-felt-muted">
          Dollar Bill = promising (more vibrant as the payoff climbs). Multiply fade = risk. Velvet
          = unpromising. Dicey does not assume you booked the ticket.
        </p>
      )}
    </section>
  );
}
