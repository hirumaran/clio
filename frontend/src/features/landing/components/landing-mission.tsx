import { motion } from "framer-motion"
import { SectionWrapper, Eyebrow } from "./landing-primitives"

export function LandingMission() {
  return (
    <SectionWrapper className="py-24 md:py-36 lg:py-44">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Eyebrow className="mb-8">Our mission</Eyebrow>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="text-3xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight font-light text-[var(--text-primary)]"
            >
              Theatre programs deserve tools as refined as the productions they build.
            </motion.h2>
          </div>

          <div className="lg:pt-16">
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
              className="text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]"
            >
              Clio was built to remove the friction from sharing resources between drama departments.
              We believe every teacher should spend less time chasing inventory and more time inspiring students.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="mt-6 text-lg md:text-xl leading-relaxed text-[var(--text-secondary)]"
            >
              From vintage gowns to wireless microphones, Clio makes it easy to see what is available,
              request it, and return it — all within your district.
            </motion.p>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
