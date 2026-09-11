import { POINT_NUMBERS, type Point } from "@/lib/craps/types";
import { useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

export function NumberPad() {
  const point = useDicey((s) => s.point);
  const setPoint = useDicey((s) => s.setPoint);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="font-table text-[0.62rem] tracking-[0.22em] text-felt-muted">
          SET THE NUMBER
        </p>
        <button
          type="button"
          onClick={() => setPoint(null)}
          className="min-h-11 px-2 font-table text-[0.68rem] tracking-[0.14em] text-felt-muted uppercase hover:text-felt-ink"
        >
          Come-out
        </button>
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {POINT_NUMBERS.map((n) => (
          <PadKey
            key={n}
            n={n}
            active={point === n}
            onSelect={() => setPoint(n)}
          />
        ))}
      </div>
    </div>
  );
}

function PadKey({
  n,
  active,
  onSelect,
}: {
  n: Point;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={cn(
        "flex h-12 items-center justify-center rounded-sm font-table text-lg tracking-wide transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
        active ? "bg-dollar-bill text-felt" : "bg-ink/8 text-felt-ink hover:bg-ink/12",
      )}
    >
      {n}
    </button>
  );
}
