import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  useMotionValue,
  useReducedMotion,
  type MotionValue,
} from "framer-motion"
import { useRef } from "react"
import { ArrowRight, ArrowDown } from "lucide-react"
import { Link } from "react-router-dom"
import { SectionWrapper, LandingLinkButton } from "./landing-primitives"
import { Magnetic, CountUp } from "./landing-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const METRICS = [
  { value: "2,200+", label: "Shared resources" },
  { value: "3", label: "District schools" },
  { value: "95%", label: "Fulfillment rate" },
]

/* ─── Architectural plan illustration with drawn-in connections ─── */
function PlanHero({ mx, my }: { mx: MotionValue<number>; my: MotionValue<number> }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  // Scroll parallax + pointer-driven tilt for a sense of depth.
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [-2, 2])
  const tiltX = useTransform(my, [-0.5, 0.5], [6, -6])
  const tiltY = useTransform(mx, [-0.5, 0.5], [-8, 8])
  const sRot = useSpring(scrollRotate, { stiffness: 80, damping: 30 })
  const sTiltX = useSpring(tiltX, { stiffness: 120, damping: 18 })
  const sTiltY = useSpring(tiltY, { stiffness: 120, damping: 18 })

  const CREAM = "var(--text-primary)"
  const GOLD = "var(--primary)"
  const GREY = "var(--text-muted)"
  const STONE = "var(--border-default)"

  const drawLine = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: isInView ? { pathLength: 1, opacity: 0.6 } : {},
          transition: { duration: 1.1, ease: EASE, delay },
        }

  return (
    <motion.div
      ref={ref}
      className="relative w-full aspect-[4/3] max-w-[520px] mx-auto"
      style={{ rotateZ: sRot, rotateX: sTiltX, rotateY: sTiltY, transformPerspective: 1000 }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: EASE, delay: 0.3 }}
    >
      <svg viewBox="0 0 520 390" className="w-full h-full overflow-visible" aria-hidden="true">
        <defs>
          <pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="transparent" />
            <circle cx="2" cy="2" r="1" fill={GOLD} opacity="0.5" />
          </pattern>
          <linearGradient id="planGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.5" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        <rect x="60" y="40" width="400" height="300" rx="2" fill="none" stroke={STONE} strokeWidth="0.75" opacity="0.4" />

        {/* Zone blocks fade/scale in sequentially */}
        {[
          { x: 80, y: 60, w: 160, h: 120, gold: true, label: "COSTUMES", lx: 90, ly: 78, d: 0.45 },
          { x: 260, y: 60, w: 180, h: 120, gold: false, label: "PROPS", lx: 270, ly: 78, d: 0.55 },
          { x: 80, y: 200, w: 260, h: 120, gold: false, label: "SET PIECES", lx: 90, ly: 218, d: 0.65 },
          { x: 360, y: 200, w: 80, h: 120, gold: true, label: "LIGHTING", lx: 370, ly: 218, d: 0.75 },
        ].map((z) => (
          <motion.g
            key={z.label}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7, ease: EASE, delay: z.d }}
            style={{ transformOrigin: `${z.x + z.w / 2}px ${z.y + z.h / 2}px` }}
          >
            <rect x={z.x} y={z.y} width={z.w} height={z.h} fill={z.gold ? "url(#planGold)" : "none"} stroke={CREAM} strokeWidth="0.75" opacity={z.gold ? 0.4 : 0.28} />
            {z.gold && <rect x={z.x} y={z.y} width={z.w} height={z.h} fill="url(#dither)" opacity="0.7" />}
            <text x={z.lx} y={z.ly} fill={GREY} fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.1em">{z.label}</text>
          </motion.g>
        ))}

        {/* Connection lines draw on with the schedule */}
        <motion.line x1="240" y1="120" x2="260" y2="120" stroke={GOLD} strokeWidth="1.25" {...drawLine(0.9)} />
        <motion.line x1="340" y1="180" x2="340" y2="200" stroke={GOLD} strokeWidth="1.25" {...drawLine(1.0)} />
        <motion.path d="M340 200 L340 260 L360 260" fill="none" stroke={GOLD} strokeWidth="1.25" {...drawLine(1.1)} />

        {/* Pulsing junction nodes */}
        {[
          { cx: 250, cy: 120, d: 1.1 },
          { cx: 340, cy: 190, d: 1.2 },
          { cx: 400, cy: 260, d: 1.3 },
        ].map((n) => (
          <motion.circle
            key={`${n.cx}-${n.cy}`}
            cx={n.cx}
            cy={n.cy}
            r="4"
            fill={GOLD}
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: [0, 1.4, 1], opacity: 1 } : {}}
            transition={{ duration: 0.6, ease: EASE, delay: n.d }}
            style={{ transformOrigin: `${n.cx}px ${n.cy}px` }}
          />
        ))}

        <g transform="translate(460, 310)">
          <line x1="0" y1="30" x2="0" y2="0" stroke={GREY} strokeWidth="0.5" />
          <polygon points="0,-8 -4,0 4,0" fill={GREY} />
          <text x="8" y="4" fill={GREY} fontSize="7" fontFamily="Inter, sans-serif">N</text>
        </g>
      </svg>
    </motion.div>
  )
}

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  // Normalized pointer position (-0.5 → 0.5) shared with the illustration.
  const mx = useMotionValue(0)
  const my = useMotionValue(0)

  const handleMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = sectionRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    if (!reduce) {
      mx.set(px - 0.5)
      my.set(py - 0.5)
    }
    el.style.setProperty("--mx", `${px * 100}%`)
    el.style.setProperty("--my", `${py * 100}%`)
  }

  return (
    <SectionWrapper
      ref={sectionRef}
      onMouseMove={handleMove}
      className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 md:pt-20"
    >
      {/* Cursor-tracked spotlight */}
      <div className="landing-spotlight pointer-events-none absolute inset-0 z-0" aria-hidden="true" />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full">
          <div className="max-w-xl order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="mb-6 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: "var(--text-muted)" }}
            >
              <span className="inline-block h-px w-8 bg-[var(--primary)]" />
              Drama Teacher Resource Library
            </motion.p>

            <h1 className="text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-tight font-light">
              {["Built for the", "stage."].map((line, i) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    className="block"
                    initial={{ y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.12 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
              className="mt-8 max-w-md text-base leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              Borrow, lend, and track props, costumes, and set pieces across your district.
              One shared catalogue for every production.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <Magnetic strength={0.4}>
                <LandingLinkButton to="/signup" variant="primary" className="group">
                  Create a free account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </LandingLinkButton>
              </Magnetic>
              <Magnetic strength={0.25}>
                <LandingLinkButton to="/catalogue" variant="outline">
                  Browse catalogue
                </LandingLinkButton>
              </Magnetic>
            </motion.div>

            {/* Animated metrics strip */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
              className="mt-14 grid grid-cols-3 gap-6 max-w-md border-t border-[var(--border-default)] pt-8"
            >
              {METRICS.map((m) => (
                <div key={m.label}>
                  <CountUp
                    value={m.value}
                    className="block text-2xl md:text-3xl font-light tracking-tight text-[var(--text-primary)]"
                  />
                  <span className="mt-1.5 block text-[10px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
                    {m.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <PlanHero mx={mx} my={my} />
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="container absolute bottom-8 left-0 right-0 z-10"
      >
        <Link to="#platform" className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-widest transition-colors hover:text-[var(--text-primary)]" style={{ color: "var(--text-muted)" }}>
          Scroll
          <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </motion.span>
        </Link>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "var(--border-default)" }} />
    </SectionWrapper>
  )
}
