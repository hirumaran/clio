import { useRef } from "react"
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Architectural showcase panel.
 * A geometric "district map" whose connections draw in on scroll and
 * whose blocks drift at different depths for parallax. No stock imagery.
 */
export function LandingShowcase() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })

  // Parallax depths for the three feature blocks.
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [40, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -60])
  const y3 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [20, -30])

  return (
    <section className="w-full">
      <div className="container">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden border border-[var(--border-default)] bg-[var(--bg-muted)]"
        >
          <svg
            viewBox="0 0 1200 514"
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <pattern id="showcase-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <rect width="24" height="24" fill="transparent" />
                <circle cx="2" cy="2" r="1" fill="var(--text-muted)" opacity="0.35" />
              </pattern>
              <linearGradient id="showcase-gold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <rect width="1200" height="514" fill="url(#showcase-dots)" />

            {/* Three zones */}
            <rect x="80" y="80" width="360" height="360" fill="none" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.45" />
            <rect x="420" y="80" width="360" height="360" fill="url(#showcase-gold)" stroke="var(--primary)" strokeWidth="0.5" opacity="0.6" />
            <rect x="760" y="80" width="360" height="360" fill="none" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.45" />

            {/* Connecting lines draw on scroll */}
            <motion.path
              d="M260 260 L600 260 L940 260"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1"
              style={{ pathLength: reduce ? 1 : scrollYProgress, opacity: 0.55 }}
            />
            <motion.path
              d="M600 80 L600 440"
              fill="none"
              stroke="var(--border-default)"
              strokeWidth="0.5"
              style={{ pathLength: reduce ? 1 : scrollYProgress, opacity: 0.3 }}
            />

            {/* Junction nodes */}
            {[260, 600, 940].map((cx) => (
              <motion.circle
                key={cx}
                cx={cx}
                cy={260}
                r="4"
                fill="var(--primary)"
                initial={{ scale: 0 }}
                whileInView={{ scale: [0, 1.4, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.2 + (cx / 1200) * 0.5 }}
                style={{ transformOrigin: `${cx}px 260px` }}
              />
            ))}
          </svg>

          {/* Parallax floating blocks */}
          <motion.div style={{ y: y1 }} className="absolute left-[8%] top-[18%] h-16 w-16 md:h-24 md:w-24 border border-[var(--border-default)] bg-[var(--bg-raised)]/70 backdrop-blur-sm" />
          <motion.div style={{ y: y2 }} className="absolute left-[50%] top-[24%] h-20 w-20 md:h-28 md:w-28 border border-[var(--primary)]/40 bg-[var(--bg-raised)]/70 backdrop-blur-sm" />
          <motion.div style={{ y: y3 }} className="absolute left-[78%] top-[34%] h-24 w-24 md:h-32 md:w-32 border border-[var(--border-default)] bg-[var(--bg-raised)]/70 backdrop-blur-sm" />

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)] via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
              A shared district catalogue for costumes, props, set pieces, and more.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
