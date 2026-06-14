import { motion } from "framer-motion"
import { SectionWrapper, Eyebrow } from "./landing-primitives"

const STATS = [
  { value: "40%", label: "Waste reduction" },
  { value: "80%", label: "Faster workflows" },
  { value: "95%", label: "Fulfillment rate" },
  { value: "3x", label: "More reuse" },
]

export function LandingImpact() {
  return (
    <SectionWrapper id="impact" className="bg-[var(--bg-muted)]">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mb-16 md:mb-24"
        >
          <Eyebrow className="mb-6">Impact</Eyebrow>
          <h2 className="text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight font-light text-[var(--text-primary)]">
            Tangible outcomes for district drama programs.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border-subtle)]">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
              className="bg-[var(--bg-muted)] p-8 md:p-10"
            >
              <p className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-[var(--text-primary)]">{stat.value}</p>
              <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
