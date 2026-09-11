# Dicey

Craps table betting advisor. Call the point — voice or pad — and Dicey paints the layout.

Promising spots light **Dollar Bill** green (`#6B8068`), more vibrant as the payoff climbs. Riskier bets fade with multiply against the cream felt. Traps sit **velvet**. Three modes:

- **Earth Tone** — conservative (mean − ½ SD)
- **Whiskey** — the mean after 100,000 single-throw rolls
- **Dicey** — chase upside (mean + ½ SD)

Bank is a split-flap display. Tap it to set walking-up money. Tickets scale to the bank; Dicey never assumes you booked them.

## Run

```bash
npm install
npm run dev
```

Open the printed local URL. Typecheck with `npm run typecheck`. Production build: `npm run build`.

## Stack

TanStack Start, React 19, Tailwind v4, Zustand.
