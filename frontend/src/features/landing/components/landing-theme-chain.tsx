import { useCallback, useEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "framer-motion"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

/**
 * ThemePullChain — a stage-light pull cord in the top-right of the landing.
 *
 * Pull it down (drag + spring recoil) or click/Enter to switch the house
 * lights between the warm cream gallery (light) and the dark stage (dark).
 * It drives the app's canonical class-based theme via `useTheme` (persisted to
 * localStorage "clio-theme"), so the choice survives reloads and carries into
 * the rest of the app. The colour swap rides the View Transitions API as a
 * circular reveal originating from the knob, with a clean instant fallback.
 */

const KNOB_TOP = 80 // resting y of the knob (px from top) — clears the nav pill
const CORD_BASE = 76 // resting cord length so it meets the knob at rest
const MAX_PULL = 46 // how far the knob can be dragged
const PULL_THRESHOLD = 22 // drag distance that counts as a deliberate pull

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { ready: Promise<void> }
}

function htmlIsDark() {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
  )
}

export function ThemePullChain() {
  const { setTheme } = useTheme()
  const reduceMotion = useReducedMotion()
  const knobRef = useRef<HTMLButtonElement>(null)
  const justDragged = useRef(false)

  // The <html> class is the single source of truth (the pre-paint script and
  // ThemeProvider both write it). Mirror it so the icon/glow stay in sync even
  // if the theme changes elsewhere (settings, system preference).
  const [isDark, setIsDark] = useState(htmlIsDark)
  useEffect(() => {
    const sync = () => setIsDark(htmlIsDark())
    const obs = new MutationObserver(sync)
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })
    return () => obs.disconnect()
  }, [])

  const y = useMotionValue(0)
  const cordHeight = useTransform(y, (v) => CORD_BASE + Math.max(0, v))

  const toggle = useCallback(() => {
    const next = htmlIsDark() ? "light" : "dark"
    const vtDoc = document as ViewTransitionDoc

    // Flip the class synchronously (so the view-transition snapshot is correct)
    // then persist through the provider, which keeps React context + "clio-theme"
    // in sync and harmlessly re-applies the same class.
    const commit = () => {
      const root = document.documentElement
      root.classList.remove("light", "dark")
      root.classList.add(next)
      setTheme(next)
    }

    if (reduceMotion || !vtDoc.startViewTransition || !knobRef.current) {
      commit()
      return
    }

    vtDoc
      .startViewTransition(() => flushSync(commit))
      .ready.then(() => {
        const el = knobRef.current
        if (!el) return
        const { left, top, width, height } = el.getBoundingClientRect()
        const cx = left + width / 2
        const cy = top + height / 2
        const radius = Math.hypot(
          Math.max(cx, window.innerWidth - cx),
          Math.max(cy, window.innerHeight - cy)
        )
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${cx}px ${cy}px)`,
              `circle(${radius}px at ${cx}px ${cy}px)`,
            ],
          },
          {
            duration: 650,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      })
      .catch(() => {})
  }, [reduceMotion, setTheme])

  // Click / keyboard activation: a quick downward tug that recoils, then toggle.
  const onActivate = useCallback(() => {
    if (justDragged.current) {
      justDragged.current = false
      return
    }
    if (!reduceMotion) {
      animate(y, [0, 14, 0], {
        duration: 0.5,
        times: [0, 0.28, 1],
        ease: ["easeOut", [0.34, 1.56, 0.64, 1]],
      })
    }
    toggle()
  }, [reduceMotion, toggle, y])

  const label = isDark ? "Switch to light mode" : "Switch to dark mode"

  return (
    <div
      className="pointer-events-none fixed right-5 top-0 z-40 h-[150px] w-12 sm:right-7"
    >
      {/* ceiling anchor */}
      <span
        aria-hidden
        className="absolute left-1/2 top-0 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
        style={{ background: "var(--border-strong)" }}
      />
      {/* cord — stretches as the knob is pulled */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 top-1 w-px -translate-x-1/2 origin-top"
        style={{
          height: cordHeight,
          background: "linear-gradient(var(--border-strong), var(--text-muted))",
        }}
      />
      {/* knob — the pull handle and the accessible toggle */}
      <motion.button
        ref={knobRef}
        type="button"
        onClick={onActivate}
        aria-pressed={isDark}
        aria-label={label}
        title={label}
        drag="y"
        dragConstraints={{ top: 0, bottom: MAX_PULL }}
        dragElastic={0.12}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.y) > 4) justDragged.current = true
          if (info.offset.y > PULL_THRESHOLD) toggle()
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto absolute left-1/2 flex h-9 w-9 cursor-grab touch-none items-center justify-center rounded-full border outline-none transition-colors active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        style={{
          top: KNOB_TOP,
          x: "-50%",
          y,
          background: "var(--bg-raised)",
          borderColor: "var(--border-default)",
          boxShadow: isDark
            ? "0 0 0 1px rgba(255,106,77,0.35), 0 8px 22px -6px rgba(255,106,77,0.5)"
            : "0 6px 16px -8px rgba(20,19,15,0.45)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "sun" : "moon"}
            initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.28 }}
            className="flex"
            style={{ color: isDark ? "var(--ember)" : "var(--text-primary)" }}
          >
            {isDark ? (
              <Sun size={16} strokeWidth={1.9} />
            ) : (
              <Moon size={16} strokeWidth={1.9} />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}
