import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type ElementType,
} from "react"
import {
  motion,
  animate,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
  useReducedMotion,
} from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

/* ──────────────────────────────────────────────────────────────
   ScrollProgress — thin accent bar pinned to the top of the page,
   width driven by overall scroll position.
   ────────────────────────────────────────────────────────────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, transparent, var(--primary), var(--text-primary))",
      }}
    />
  )
}

/* ──────────────────────────────────────────────────────────────
   Magnetic — pulls its child toward the cursor on hover, springs
   back on leave. Disabled under reduced-motion + on touch.
   ────────────────────────────────────────────────────────────── */
export function Magnetic({
  children,
  strength = 0.35,
  className = "",
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 })

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const relX = e.clientX - (rect.left + rect.width / 2)
    const relY = e.clientY - (rect.top + rect.height / 2)
    x.set(relX * strength)
    y.set(relY * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────
   CountUp — counts a numeric value up from zero when scrolled into
   view. Parses a display string like "2,200+", "99.9%", "3x" and
   preserves its prefix/suffix while animating the number.
   ────────────────────────────────────────────────────────────── */
function parseMetric(value: string) {
  const match = value.match(/-?[\d.,]+/)
  if (!match) return { prefix: "", number: 0, suffix: value, decimals: 0, hasComma: false }
  const raw = match[0]
  const prefix = value.slice(0, match.index)
  const suffix = value.slice((match.index ?? 0) + raw.length)
  const hasComma = raw.includes(",")
  const numeric = parseFloat(raw.replace(/,/g, ""))
  const dot = raw.replace(/,/g, "").split(".")[1]
  const decimals = dot ? dot.length : 0
  return { prefix, number: numeric, suffix, decimals, hasComma }
}

export function CountUp({
  value,
  className = "",
  duration = 1.6,
}: {
  value: string
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduce = useReducedMotion()
  const { prefix, number, suffix, decimals, hasComma } = parseMetric(value)
  const count = useMotionValue(0)
  // Render the formatted value straight off the motion value — framer keeps
  // the span's text in sync without per-frame React re-renders.
  const text = useTransform(count, (latest) => formatNumber(latest, decimals, hasComma))

  useEffect(() => {
    if (reduce) {
      count.set(number)
      return
    }
    if (!inView) return
    const controls = animate(count, number, { duration, ease: EASE })
    return () => controls.stop()
  }, [inView, reduce, number, duration, count])

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  )
}

function formatNumber(n: number, decimals: number, hasComma: boolean) {
  const fixed = n.toFixed(decimals)
  if (!hasComma) return fixed
  const [int, dec] = fixed.split(".")
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  return dec ? `${withCommas}.${dec}` : withCommas
}

/* ──────────────────────────────────────────────────────────────
   Marquee — seamless infinite horizontal scroll. Pauses on hover.
   ────────────────────────────────────────────────────────────── */
export function Marquee({
  children,
  speed = 40,
  className = "",
}: {
  children: ReactNode
  speed?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-x-16 gap-y-8 ${className}`}>
        {children}
      </div>
    )
  }
  return (
    <div className={`marquee group relative overflow-hidden ${className}`}>
      <div
        className="marquee__track flex w-max items-center gap-x-16 md:gap-x-24"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────
   Reveal — drop-in scroll reveal with a small upward drift.
   ────────────────────────────────────────────────────────────── */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  as = "div",
  className = "",
}: {
  children: ReactNode
  delay?: number
  y?: number
  as?: ElementType
  className?: string
}) {
  const MotionTag = motion[as as keyof typeof motion] as ElementType
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

/* ──────────────────────────────────────────────────────────────
   useScrollSpy — returns the id of the section currently in view.
   ────────────────────────────────────────────────────────────── */
export function useScrollSpy(ids: string[], offset = 120) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const handler = () => {
      let current: string | null = null
      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top - offset <= 0) current = id
      }
      setActive(current)
    }
    handler()
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [ids, offset])
  return active
}
