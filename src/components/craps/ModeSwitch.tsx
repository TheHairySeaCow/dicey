import { useDicey } from "@/lib/store";
import type { Mode } from "@/lib/craps/types";
import { cn } from "@/lib/utils";

const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "earth", label: "Earth Tone", hint: "Half SD below the mean. Wider net, smaller units." },
  { id: "whiskey", label: "Whiskey", hint: "The mean ending bank. House blend." },
  { id: "dicey", label: "Dicey", hint: "Lights if upside reaches a half SD above green." },
];

export function ModeSwitch() {
  const mode = useDicey((s) => s.mode);
  const setMode = useDicey((s) => s.setMode);

  return (
    <div
      role="radiogroup"
      aria-label="Advice mode"
      className="flex rounded-md bg-ink/6 p-1"
    >
      {MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          aria-checked={mode === m.id}
          title={m.hint}
          onClick={() => setMode(m.id)}
          className={cn(
            "min-h-11 flex-1 rounded-sm px-2 font-table text-[0.7rem] tracking-[0.12em] uppercase transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96] sm:text-xs",
            mode === m.id ? "bg-dollar-bill text-felt" : "text-felt-muted hover:text-felt-ink",
          )}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
