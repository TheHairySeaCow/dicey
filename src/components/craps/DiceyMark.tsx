import { useState } from "react";
import { cn } from "@/lib/utils";

export function DiceyMark({ className }: { className?: string }) {
  const [shake, setShake] = useState(false);

  return (
    <button
      type="button"
      aria-label="Dicey lucky die"
      title="Give it a shake"
      onClick={() => setShake(true)}
      onAnimationEnd={() => setShake(false)}
      className={cn(
        "size-12 shrink-0 rounded-[14px] bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dollar-bill",
        className,
      )}
    >
      <svg
        viewBox="0 0 64 64"
        className={cn("size-full origin-[50%_72%]", shake ? "dicey-shake" : "dicey-wobble")}
        aria-hidden
      >
        <rect width="64" height="64" rx="16" fill="#7A1B2B" />
        <rect x="10" y="11" width="44" height="44" rx="10" fill="#556853" />
        <rect x="9" y="9" width="44" height="44" rx="10" fill="#6B8068" />
        <path
          d="M19 13.5h22a8 8 0 0 1 8 8v6c-6-8-18-12-34-8 1.2-3.6 2.8-6 4-6z"
          fill="#8A9E86"
          opacity="0.45"
        />
        <circle cx="24.5" cy="26.5" r="5.4" fill="#EFE8D4" />
        <circle cx="25.8" cy="27.4" r="2.35" fill="#1C1917" />
        <rect x="35.2" y="24.6" width="11.2" height="4.2" rx="2.1" fill="#EFE8D4" />
        <path
          d="M23.5 39.5c3.6 6.2 14.4 6.2 18 0"
          fill="none"
          stroke="#EFE8D4"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <path
          d="M50 14.5l1.35 3.1 3.15 1.35-3.15 1.35L50 23.4l-1.35-3.1-3.15-1.35 3.15-1.35z"
          fill="#EFE8D4"
        />
      </svg>
    </button>
  );
}
