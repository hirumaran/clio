import { motion } from "framer-motion"
import { Eyebrow } from "./landing-primitives"

const EASE = [0.22, 1, 0.36, 1] as const

/**
 * Showcase band — a single hairline-bordered placard.
 * Pure typography on white; the 1px border defines the edge (no shadow).
 */
export function LandingShowcase() {
  return (
    <section className="w-full">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="rounded-[4px] border border-[var(--border-default)] px-8 py-16 md:px-16 md:py-24 text-center"
        >
          <Eyebrow className="mb-8">The catalogue</Eyebrow>
          <p className="mx-auto max-w-2xl text-[clamp(1.5rem,4vw,2.75rem)] leading-[1.1] tracking-[-0.03em] font-medium text-[var(--text-primary)]">
            One shared district catalogue for costumes, props, set pieces,
            lighting, sound, and scripts.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
