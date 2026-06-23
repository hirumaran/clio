import { useRef, type CSSProperties } from "react"
import { useInView } from "framer-motion"
import { cn } from "@/lib/utils"

/* Clio brand mark — a proscenium arch (the theatre stage opening) with a
   single ember stage-light at its apex. Geometric, flat, monochrome + accent. */
export function Mark({
  size = 26,
  className = "",
  onDark = false,
}: {
  size?: number
  className?: string
  onDark?: boolean
}) {
  const ink = onDark ? "var(--primary-foreground)" : "var(--foreground)"
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      {/* proscenium arch — open stage mouth */}
      <path
        d="M5 28V14a11 11 0 0 1 22 0v14"
        stroke={ink}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* stage floor line */}
      <path d="M3.5 28h25" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      {/* ember spotlight at the apex */}
      <circle cx="16" cy="9.5" r="3" fill="var(--ember)" />
    </svg>
  )
}

export function Wordmark({ onDark = false }: { onDark?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <Mark onDark={onDark} />
      <span
        className="text-[19px] font-semibold tracking-[-0.04em]"
        style={{ color: onDark ? "var(--primary-foreground)" : "var(--foreground)" }}
      >
        Clio
      </span>
    </span>
  )
}

/* ──────────────────────────────────────────────────────────────
   ClioGrid — a full-width pixel marquee. The name reads big in bright ember
   "bulbs"; every cell of negative space around and inside it is filled with
   the same name tiled small in greyscale, so the field itself quietly spells
   "clio … clio … clio" behind the sign. Pixels strike on in a diagonal wave
   when the footer scrolls into view. Decorative — exposed to AT as "Clio".
   ────────────────────────────────────────────────────────────── */

// 5×7 bitmaps, top row first. "1" = a lit bulb.
const GLYPHS: Record<string, string[]> = {
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
}

// Render "CLIO" as a row-major boolean bitmap at an integer pixel `scale`
// (each glyph cell becomes a scale×scale block), with `gap` blank columns
// between letters. Used at large scale for the sign and at 1× for the
// greyscale watermark.
function buildWord(scale: number, gap: number): boolean[][] {
  const word = ["C", "L", "I", "O"]
  const rows = 7 * scale
  const grid: boolean[][] = Array.from({ length: rows }, () => [] as boolean[])
  word.forEach((ch, gi) => {
    const g = GLYPHS[ch]
    for (let gr = 0; gr < 7; gr++) {
      for (let sr = 0; sr < scale; sr++) {
        const row = grid[gr * scale + sr]
        for (let gc = 0; gc < 5; gc++) {
          const lit = g[gr][gc] === "1"
          for (let sc = 0; sc < scale; sc++) row.push(lit)
        }
      }
    }
    if (gi < word.length - 1) {
      for (let r = 0; r < rows; r++) for (let k = 0; k < gap; k++) grid[r].push(false)
    }
  })
  return grid
}

// The bold sign and the canvas it floats in. PAD_* is the band of greyscale
// watermark held around the sign on every side.
const BIG = buildWord(2, 6)
const BIG_ROWS = BIG.length
const BIG_COLS = BIG[0].length
const PAD_X = 24
const PAD_Y = 4
const COLS = BIG_COLS + PAD_X * 2
const ROWS = BIG_ROWS + PAD_Y * 2

// The watermark: the word at 1× tiled across the whole field with a blank
// gutter, so the negative space reads as repeating "clio".
const TINY = buildWord(1, 1)
const TINY_ROWS = TINY.length
const TINY_COLS = TINY[0].length
const TILE_H = TINY_ROWS + 3
const TILE_W = TINY_COLS + 3

type Kind = "ember" | "lit" | "dim"

function classify(r: number, c: number): Kind {
  const br = r - PAD_Y
  const bc = c - PAD_X
  if (br >= 0 && br < BIG_ROWS && bc >= 0 && bc < BIG_COLS && BIG[br][bc]) return "ember"
  const tr = r % TILE_H
  const tc = c % TILE_W
  if (tr < TINY_ROWS && tc < TINY_COLS && TINY[tr][tc]) return "lit"
  return "dim"
}

const STYLE: Record<Kind, CSSProperties> = {
  ember: {
    backgroundColor: "var(--ember)",
    boxShadow: "0 0 5px color-mix(in srgb, var(--ember) 50%, transparent)",
  },
  lit: { backgroundColor: "color-mix(in srgb, var(--text-primary) 20%, transparent)" },
  dim: { backgroundColor: "color-mix(in srgb, var(--text-primary) 5%, transparent)" },
}

// Precompute each cell's final style once — its colour plus the diagonal
// (row + column) delay that drives the strike-on wave.
const CELLS: CSSProperties[] = (() => {
  const out: CSSProperties[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      out.push({ ...STYLE[classify(r, c)], animationDelay: `${((r + c) * 0.006).toFixed(3)}s` })
    }
  }
  return out
})()

export function ClioGrid({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <div
      ref={ref}
      role="img"
      aria-label="Clio"
      className={cn("lp-clio-grid grid w-full gap-[2px]", inView && "is-playing", className)}
      style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
    >
      {CELLS.map((style, i) => (
        <span
          key={i}
          aria-hidden
          className="lp-clio-cell aspect-square rounded-[1.5px]"
          style={style}
        />
      ))}
    </div>
  )
}
