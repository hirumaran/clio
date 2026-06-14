import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, ArrowDown } from "lucide-react"
import { Link } from "react-router-dom"
import { SectionWrapper, Eyebrow, LandingLinkButton } from "./landing-primitives"

const EASE = [0.22, 1, 0.36, 1] as const

const METRICS = [
  { value: "2,200+", label: "Shared resources" },
  { value: "3", label: "District schools" },
  { value: "95%", label: "Fulfillment rate" },
]

/* ─── Architectural plan illustration with dithered zones ─── */
function PlanHero() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const rotate = useTransform(scrollYProgress, [0, 1], [-3, 3])
  const springRotate = useSpring(rotate, { stiffness: 80, damping: 30 })

  const CREAM = "var(--text-primary)"
  const GOLD = "var(--primary)"
  const GREY = "var(--text-muted)"
  const STONE = "var(--border-default)"

  return (
    <motion.div
      ref={ref}
      className="relative w-full aspect-[4/3] max-w-[520px] mx-auto"
      style={{ rotate: springRotate }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease: EASE, delay: 0.3 }}
    >
      <svg viewBox="0 0 520 390" className="w-full h-full" aria-hidden="true">
        <defs>
          <pattern id="dither" width="4" height="4" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="transparent" />
            <circle cx="2" cy="2" r="1" fill={GOLD} opacity="0.35" />
          </pattern>
          <linearGradient id="planGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.35" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0.05" />
          </linearGradient>
        </defs>

        <rect x="60" y="40" width="400" height="300" rx="2" fill="none" stroke={STONE} strokeWidth="0.5" opacity="0.25" />

        <rect x="80" y="60" width="160" height="120" fill="url(#planGold)" stroke={CREAM} strokeWidth="0.5" opacity="0.22" />
        <rect x="80" y="60" width="160" height="120" fill="url(#dither)" opacity="0.6" />
        <rect x="260" y="60" width="180" height="120" fill="none" stroke={CREAM} strokeWidth="0.5" opacity="0.18" />
        <rect x="80" y="200" width="260" height="120" fill="none" stroke={CREAM} strokeWidth="0.5" opacity="0.18" />
        <rect x="360" y="200" width="80" height="120" fill="url(#planGold)" stroke={CREAM} strokeWidth="0.5" opacity="0.2" />
        <rect x="360" y="200" width="80" height="120" fill="url(#dither)" opacity="0.5" />

        <text x="90" y="78" fill={GREY} fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.1em">COSTUMES</text>
        <text x="270" y="78" fill={GREY} fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.1em">PROPS</text>
        <text x="90" y="218" fill={GREY} fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.1em">SET PIECES</text>
        <text x="370" y="218" fill={GREY} fontSize="8" fontFamily="Inter, sans-serif" letterSpacing="0.1em">LIGHTING</text>

        <line x1="240" y1="120" x2="260" y2="120" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <line x1="340" y1="180" x2="340" y2="200" stroke={GOLD} strokeWidth="1" opacity="0.6" />
        <line x1="340" y1="200" x2="360" y2="260" stroke={GOLD} strokeWidth="1" opacity="0.4" />

        <circle cx="250" cy="120" r="4" fill={GOLD} />
        <circle cx="340" cy="190" r="4" fill={GOLD} />
        <circle cx="400" cy="260" r="4" fill={GOLD} />

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
  return (
    <SectionWrapper className="relative min-h-screen flex flex-col justify-center pt-28 pb-16 md:pt-20">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center w-full">
          <div className="max-w-xl order-2 lg:order-1">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
              className="mb-6 text-[10px] font-medium uppercase tracking-[0.25em]"
              style={{ color: "var(--text-muted)" }}
            >
              Drama Teacher Resource Library
            </motion.p>

            <h1 className="text-[clamp(3rem,9vw,6.5rem)] leading-[0.95] tracking-tight font-light">
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
                >
                  Built for the
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span
                  className="block"
                  initial={{ y: "115%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.32 }}
                >
                  stage.
                </motion.span>
              </span>
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
              <LandingLinkButton to="/signup" variant="primary" className="group">
                Create a free account
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </LandingLinkButton>
              <LandingLinkButton to="/catalogue" variant="outline">
                Browse catalogue
              </LandingLinkButton>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <PlanHero />
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
