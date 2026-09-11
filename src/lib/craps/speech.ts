import { POINT_NUMBERS, type Point } from "./types";

const WORD_TO_NUM: Record<string, number> = {
  two: 2,
  three: 3,
  four: 4,
  for: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  ate: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  yo: 11,
  boxcars: 12,
  snake: 2,
  aces: 2,
};

export type VoiceHit =
  | { kind: "point"; point: Point }
  | { kind: "sevenOut" }
  | { kind: "comeOut" }
  | { kind: "natural"; n: 7 | 11 }
  | { kind: "craps"; n: 2 | 3 | 12 }
  | { kind: "unknown"; raw: string };

export function parseVoice(transcript: string): VoiceHit {
  const raw = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!raw) return { kind: "unknown", raw: transcript };

  if (/\b(seven\s*out|sevened?\s*out|line\s*away)\b/.test(raw)) {
    return { kind: "sevenOut" };
  }
  if (/\b(come\s*out|comeout|off|puck\s*off)\b/.test(raw)) {
    return { kind: "comeOut" };
  }

  const tokens = raw.split(" ");
  const nums: number[] = [];
  for (const tok of tokens) {
    if (/^\d+$/.test(tok)) nums.push(Number(tok));
    else if (tok in WORD_TO_NUM) nums.push(WORD_TO_NUM[tok]);
  }

  // Prefer an explicit point phrase.
  const pointPhrase = raw.match(
    /\b(?:point|number|it'?s|is)\s+(?:is\s+|the\s+)?(\d+|four|for|five|six|eight|ate|nine|ten)\b/,
  );
  if (pointPhrase) {
    const n = WORD_TO_NUM[pointPhrase[1]] ?? Number(pointPhrase[1]);
    if ((POINT_NUMBERS as readonly number[]).includes(n)) {
      return { kind: "point", point: n as Point };
    }
  }

  for (const n of nums) {
    if ((POINT_NUMBERS as readonly number[]).includes(n)) {
      return { kind: "point", point: n as Point };
    }
  }

  const last = nums[nums.length - 1];
  if (last === 7 || last === 11) return { kind: "natural", n: last };
  if (last === 2 || last === 3 || last === 12) return { kind: "craps", n: last };

  return { kind: "unknown", raw: transcript };
}

export type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecEvent) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export type SpeechRecEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};

export function getSpeechCtor(): (new () => SpeechRec) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
