import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { getSpeechCtor, parseVoice } from "@/lib/craps/speech";
import type { SpeechRec } from "@/lib/craps/speech";
import { POINT_NUMBERS } from "@/lib/craps/types";
import { useDicey } from "@/lib/store";
import { cn } from "@/lib/utils";

export function VoiceButton({ className }: { className?: string }) {
  const listening = useDicey((s) => s.listening);
  const setListening = useDicey((s) => s.setListening);
  const setPoint = useDicey((s) => s.setPoint);
  const setVoiceStatus = useDicey((s) => s.setVoiceStatus);
  const recRef = useRef<SpeechRec | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(Boolean(getSpeechCtor()));
    return () => {
      recRef.current?.abort();
    };
  }, []);

  if (!supported) {
    return (
      <div
        className="flex size-12 items-center justify-center rounded-md text-felt-muted"
        title="Voice is not available in this browser"
      >
        <MicOff className="size-5" />
      </div>
    );
  }

  const toggle = () => {
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const Ctor = getSpeechCtor();
    if (!Ctor) {
      setVoiceStatus("Mic is blocked. Use the pad.");
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const last = ev.results[ev.results.length - 1];
      if (!last?.isFinal) return;
      const hit = parseVoice(last[0].transcript);
      if (hit.kind === "point") {
        setPoint(hit.point);
        setVoiceStatus(`Point is ${hit.point}`);
        rec.stop();
        setListening(false);
      } else if (hit.kind === "sevenOut" || hit.kind === "comeOut") {
        setPoint(null);
        setVoiceStatus(hit.kind === "sevenOut" ? "Seven out. Puck off." : "Come-out. Puck off.");
      } else if (hit.kind === "natural") {
        setPoint(null);
        setVoiceStatus(`${hit.n} on the come-out. Line decision.`);
      } else if (hit.kind === "craps") {
        setPoint(null);
        setVoiceStatus(`Craps ${hit.n}.`);
      } else {
        setVoiceStatus(`Heard “${hit.raw}”. Say a point — 4, 5, 6, 8, 9, or 10.`);
      }
    };
    rec.onerror = (ev) => {
      if (ev.error !== "aborted" && ev.error !== "no-speech") {
        setVoiceStatus("Mic didn’t catch that. Use the pad.");
      }
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      setVoiceStatus(`Listening. Say ${POINT_NUMBERS.join(", ")}.`);
    } catch {
      setVoiceStatus("Mic is blocked. Use the pad.");
      setListening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={listening}
      aria-label={listening ? "Stop listening" : "Set the point by voice"}
      className={cn(
        "relative flex size-12 items-center justify-center rounded-md transition-[background-color,transform] duration-150 ease-out active:scale-[0.96]",
        listening ? "bg-dollar-bill text-felt" : "bg-ink/8 text-felt-ink",
        className,
      )}
    >
      {listening ? (
        <span className="absolute inset-0 animate-pulse rounded-md bg-dollar-bill/40" />
      ) : null}
      <Mic className="relative size-5" />
    </button>
  );
}
