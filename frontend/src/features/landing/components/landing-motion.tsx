import {
  useRef,
  useState,
  useEffect,
  type ReactNode,
  type ElementType,
  type RefObject,
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
      className="fixed top-0 left-0 right-0 z-[60] h-px origin-left"
      style={{ scaleX, background: "var(--primary)" }}
    />
  )
}

/* ──────────────────────────────────────────────────────────────
   HeroScrollStroke — the scroll affordance, drawn instead of stated.
   A hand-drawn ember flourish (the same motif as the underline beneath
   "owns.") whose stroke reveals along its route as the hero scrolls past:
   pathLength is driven by the hero's own scroll progress and springed for
   momentum, so the line literally follows the reader down the page. A faint
   ghost track shows where it's headed; a small "Scroll" eyebrow fades once
   they engage. The whole thing stays an anchor to the first section, so it
   keeps the original tap-to-scroll job. Under reduced motion the stroke is
   simply drawn in full and held static.
   ────────────────────────────────────────────────────────────── */
const HERO_STROKE_PATH =
  "M40 120 C150 120 200 70 320 78 C420 84 470 124 560 120 C600 120 720 40 700 30 C685 22 600 22 590 40 C575 70 660 122 720 120 C800 118 850 78 950 84 C1040 90 1090 116 1160 110"

export function HeroScrollStroke({
  targetRef,
  href = "#proof",
  className = "",
}: {
  /** The hero <header>; its scroll-out drives how far the stroke is drawn. */
  targetRef: RefObject<HTMLElement | null>
  href?: string
  className?: string
}) {
  const reduce = useReducedMotion()
  // 0 at the top of the page → 1 once the hero has scrolled fully past the top.
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  })
  // Front-load the draw into the first ~65% of that travel so the line
  // completes while still on screen; rest ~18% drawn as a standing invitation.
  const drawn = useTransform(scrollYProgress, [0, 0.65], [0.18, 1])
  const pathLength = useSpring(drawn, { stiffness: 90, damping: 28, mass: 0.4 })
  const labelOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])

  return (
    <motion.a
      href={href}
      aria-label="Scroll to content"
      className={`relative z-10 mx-auto block w-full max-w-[560px] ${className}`}
    >
      <motion.span
        className="lp-eyebrow block text-center text-[var(--text-muted)]"
        style={reduce ? undefined : { opacity: labelOpacity }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        transition={{ delay: 1.1, duration: 0.8 }}
      >
        Scroll
      </motion.span>

      <svg
        viewBox="0 0 1200 144"
        fill="none"
        aria-hidden="true"
        className="mt-3 h-auto w-full overflow-visible"
      >
        {/* ghost track — the line's full route, faint */}
        <path
          d={HERO_STROKE_PATH}
          stroke="var(--border-strong)"
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
        {/* ember stroke — reveals along the route with scroll */}
        <motion.path
          d={HERO_STROKE_PATH}
          stroke="var(--ember)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: reduce ? 1 : pathLength,
            filter:
              "drop-shadow(0 1px 6px color-mix(in srgb, var(--ember) 45%, transparent))",
          }}
        />
      </svg>
    </motion.a>
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
  reverse = false,
  className = "",
}: {
  children: ReactNode
  speed?: number
  /** Scroll right-to-left by default; set true to run the track the other way. */
  reverse?: boolean
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
      {/* Two identical copies, each carrying its own trailing gap (pr-*), so the
          -50% scroll lands copy two exactly where copy one began — seamless, with
          no half-gap jump at the seam. The duplicate is aria-hidden to stay out of
          the reading order and to avoid colliding keys with the first copy. */}
      <div
        className="marquee__track flex w-max"
        style={{ animationDuration: `${speed}s`, animationDirection: reverse ? "reverse" : undefined }}
      >
        <div className="flex shrink-0 items-center gap-x-16 pr-16 md:gap-x-24 md:pr-24">
          {children}
        </div>
        <div aria-hidden className="flex shrink-0 items-center gap-x-16 pr-16 md:gap-x-24 md:pr-24">
          {children}
        </div>
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
   Stagger / StaggerItem — orchestrated scroll reveal. The parent
   cascades its children in sequence instead of a single block fade.
   Pair them: <Stagger><StaggerItem/>…</Stagger>. Under reduced motion
   Framer keeps the fade and drops the y-transform.
   ────────────────────────────────────────────────────────────── */
export function Stagger({
  children,
  delay = 0,
  stagger = 0.08,
  as = "div",
  className = "",
}: {
  children: ReactNode
  delay?: number
  stagger?: number
  as?: ElementType
  className?: string
}) {
  const MotionTag = motion[as as keyof typeof motion] as ElementType
  return (
    <MotionTag
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      className={className}
    >
      {children}
    </MotionTag>
  )
}

export function StaggerItem({
  children,
  y = 16,
  as = "div",
  className = "",
}: {
  children: ReactNode
  y?: number
  as?: ElementType
  className?: string
}) {
  const MotionTag = motion[as as keyof typeof motion] as ElementType
  return (
    <MotionTag
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
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
  // Callers pass a fresh array each render (ids.map(...)); a joined string keeps
  // the effect from re-subscribing the scroll listener on every render.
  const key = ids.join("|")
  useEffect(() => {
    const list = key ? key.split("|") : []
    let raf = 0
    const compute = () => {
      raf = 0
      let current: string | null = null
      for (const id of list) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top - offset <= 0) current = id
      }
      setActive(current)
    }
    // rAF-throttle so layout is read at most once per frame instead of on every
    // (potentially sub-frame) passive scroll event.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute)
    }
    compute()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [key, offset])
  return active
}
