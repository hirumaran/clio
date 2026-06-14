import { motion } from "framer-motion"
import { Eyebrow } from "./landing-primitives"

const PARTNERS = [
  "Big Picture",
  "Newport",
  "Sammamish",
  "Edmonds",
  "Lake Washington",
]

export function LandingLogos() {
  return (
    <section className="py-16 md:py-24 border-t border-b border-[var(--border-subtle)]">
      <div className="container">
        <Eyebrow className="mb-10 md:mb-14 text-center">Partner districts</Eyebrow>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 md:gap-x-20">
          {PARTNERS.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.06 }}
              className="school-watermark text-lg md:text-xl text-[var(--text-muted)]"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
