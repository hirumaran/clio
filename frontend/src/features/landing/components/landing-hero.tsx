import { motion } from "framer-motion"
import { ArrowDown } from "lucide-react"
import { Link } from "react-router-dom"
import { SectionWrapper, LandingLinkButton } from "./landing-primitives"
import { CountUp } from "./landing-motion"

const EASE = [0.22, 1, 0.36, 1] as const

const METRICS = [
  { value: "2,200+", label: "Shared resources" },
  { value: "3", label: "District schools" },
  { value: "95%", label: "Fulfillment rate" },
]

export function LandingHero() {
  return (
    <SectionWrapper className="relative min-h-screen flex flex-col justify-center pt-32 pb-16">
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
            className="mb-8 text-[13px] font-medium tracking-[-0.01em] text-[var(--primary)]"
          >
            Drama Teacher Resource Library
          </motion.p>

          <h1 className="text-[clamp(2.75rem,8vw,5.5rem)] leading-[1.02] tracking-[-0.04em] font-medium text-[var(--text-primary)]">
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
            className="mx-auto mt-8 max-w-xl text-[18px] leading-[1.6] tracking-[-0.01em] text-[var(--text-secondary)]"
          >
            Borrow, lend, and track props, costumes, and set pieces across your district.
            One shared catalogue for every production.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
          >
            <LandingLinkButton to="/signup" variant="primary">
              Create a free account
            </LandingLinkButton>
            <LandingLinkButton to="/catalogue" variant="outline">
              Browse catalogue
            </LandingLinkButton>
          </motion.div>

          {/* Quiet hairline metrics — no fills, no shadow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.8 }}
            className="mx-auto mt-20 grid max-w-xl grid-cols-3 gap-8 border-t border-[var(--border-default)] pt-10"
          >
            {METRICS.map((m) => (
              <div key={m.label}>
                <CountUp
                  value={m.value}
                  className="block text-2xl md:text-3xl font-medium tracking-[-0.03em] text-[var(--text-primary)]"
                />
                <span className="mt-2 block text-[12px] tracking-[-0.01em] text-[var(--text-muted)]">
                  {m.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="container absolute bottom-8 left-0 right-0 z-10 flex justify-center"
      >
        <Link
          to="#platform"
          className="group inline-flex items-center gap-2 text-[12px] tracking-[-0.01em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          Scroll
          <motion.span animate={{ y: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>
            <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
          </motion.span>
        </Link>
      </motion.div>
    </SectionWrapper>
  )
}
