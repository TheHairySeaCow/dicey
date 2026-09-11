import { formatDollars, useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

function Digit({ value, compact }: { value: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flap-digit",
        compact ? "text-[1.15rem]" : "text-[1.35rem] sm:text-[1.65rem]",
      )}
      aria-hidden="true"
    >
      <div className="flap-half flap-top">
        <span>{value}</span>
      </div>
      <div className="flap-half flap-bottom">
        <span>{value}</span>
      </div>
      <div className="flap-hinge" />
    </div>
  );
}

export function FlipBank({ compact }: { compact?: boolean }) {
  const bank = useDicey((s) => s.bank);
  const setEditorOpen = useDicey((s) => s.setEditorOpen);
  const digits = Math.round(Math.max(0, bank)).toString().padStart(4, "0").slice(-6);
  const chars = ["$", ...digits.split("")];

  return (
    <button
      type="button"
      onClick={() => setEditorOpen(true)}
      className="group flex flex-col items-start gap-1 rounded-lg p-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dollar-bill"
      aria-label={`Bank ${formatDollars(bank)}. Tap to edit.`}
    >
      <span className="font-table text-[0.62rem] tracking-[0.22em] text-felt-muted">
        BANK
      </span>
      <span className="flex items-center gap-[3px] rounded-md bg-flap-edge p-[3px] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_8px_18px_rgb(28_25_23/0.18)]">
        {chars.map((ch, i) => (
          <Digit key={`${i}-${ch}`} value={ch} compact={compact} />
        ))}
      </span>
      {compact ? null : (
        <span className="text-[0.68rem] text-felt-muted transition-opacity duration-150 group-hover:text-felt-ink">
          Tap flaps to set
        </span>
      )}
    </button>
  );
}
