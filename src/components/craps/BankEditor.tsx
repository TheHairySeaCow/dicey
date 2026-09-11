import { useEffect, useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDollars, useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"] as const;

export function BankEditor() {
  const open = useDicey((s) => s.editorOpen);
  const bank = useDicey((s) => s.bank);
  const setBank = useDicey((s) => s.setBank);
  const confirmBank = useDicey((s) => s.confirmBank);
  const setEditorOpen = useDicey((s) => s.setEditorOpen);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    if (open) setDraft(bank > 0 ? String(Math.round(bank)) : "");
  }, [open, bank]);

  if (!open) return null;

  const value = draft === "" ? 0 : Number(draft);
  const press = (k: (typeof KEYS)[number]) => {
    if (k === "del") {
      setDraft((d) => d.slice(0, -1));
      return;
    }
    setDraft((d) => {
      const next = (d + k).replace(/^0+(?=\d)/, "");
      return next.slice(0, 7);
    });
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-ink/45 p-3 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bank-editor-title"
      onClick={() => setEditorOpen(false)}
    >
      <div
        className="ticket-card w-full max-w-sm rounded-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="bank-editor-title" className="font-display text-xl text-ink">
          Walking-up money
        </p>
        <p className="mt-1 text-sm text-felt-muted">
          Dicey sizes the ticket from this bank. It never assumes you bet.
        </p>
        <p className="mt-4 font-table text-3xl tabular-nums tracking-wide text-ink">
          {formatDollars(value)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {KEYS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => press(k)}
              className={cn(
                "h-12 rounded-md bg-felt-ink/6 font-table text-lg tracking-wide text-ink transition-transform duration-150 ease-out active:scale-[0.96]",
                k === "del" && "text-velvet",
              )}
            >
              {k === "del" ? <Delete className="mx-auto size-5" /> : k}
            </button>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => setEditorOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="dollarBill"
            className="flex-1"
            onClick={() => {
              setBank(value);
              confirmBank();
            }}
          >
            Set bank
          </Button>
        </div>
      </div>
    </div>
  );
}
