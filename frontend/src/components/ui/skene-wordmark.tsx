import { cn } from "@/lib/utils"

const glyphs = {
  C: [
    "01110",
    "10001",
    "10000",
    "10001",
    "01110",
  ],
  A: [
    "01110",
    "10001",
    "11111",
    "10001",
    "10001",
  ],
  L: [
    "10000",
    "10000",
    "10000",
    "10000",
    "11111",
  ],
  I: [
    "11111",
    "00100",
    "00100",
    "00100",
    "11111",
  ],
  O: [
    "01110",
    "10001",
    "10001",
    "10001",
    "01110",
  ],
  P: [
    "11110",
    "10001",
    "11110",
    "10000",
    "10000",
  ],
  E: [
    "11111",
    "10000",
    "11110",
    "10000",
    "11111",
  ],
} as const

const wordmark = [
  { glyph: "C", accented: false },
  { glyph: "L", accented: false },
  { glyph: "I", accented: false },
  { glyph: "O", accented: false },
] as const

const dotRadius = 2.55
const dotPitch = 7
const glyphColumns = 5
const glyphWidth = dotRadius * 2 + (glyphColumns - 1) * dotPitch
const letterGap = 4
const viewBoxWidth =
  wordmark.length * glyphWidth + (wordmark.length - 1) * letterGap
const viewBoxHeight = dotRadius * 2 + 5 * dotPitch
const macron = "01110"

interface ClioWordmarkProps {
  className?: string
}

export function ClioWordmark({ className }: ClioWordmarkProps) {
  return (
    <svg
      aria-label="Clio"
      className={cn("h-full w-full fill-current", className)}
      focusable="false"
      role="img"
      shapeRendering="geometricPrecision"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
    >
      <title>Clio</title>
      {wordmark.flatMap((letter, letterIndex) => {
        const xOffset = letterIndex * (glyphWidth + letterGap)
        const rows = [
          letter.accented ? macron : "00000",
          ...glyphs[letter.glyph],
        ]

        return rows.flatMap((row, rowIndex) =>
          [...row].map((cell, columnIndex) => {
            if (cell !== "1") return null

            return (
              <circle
                key={`${letterIndex}-${rowIndex}-${columnIndex}`}
                cx={xOffset + dotRadius + columnIndex * dotPitch}
                cy={dotRadius + rowIndex * dotPitch}
                r={dotRadius}
              />
            )
          }),
        )
      })}
    </svg>
  )
}
