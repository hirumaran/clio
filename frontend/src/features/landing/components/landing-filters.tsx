import { useState } from "react"
import { motion } from "framer-motion"
import { SectionWrapper, Eyebrow } from "./landing-primitives"

const CAPABILITIES = [
  "Resources",
  "Inventory",
  "Collaboration",
  "Borrowing",
  "Lending",
  "Analytics",
  "District Management",
]

export function LandingFilters() {
  const [active, setActive] = useState("Resources")

  return (
    <SectionWrapper id="platform" className="py-16 md:py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Eyebrow className="mb-8 md:mb-10 text-center md:text-left">Platform capabilities</Eyebrow>
        </motion.div>

        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
          {CAPABILITIES.map((cap, i) => {
            const selected = active === cap
            return (
              <motion.button
                key={cap}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                onClick={() => setActive(cap)}
                className={`px-5 py-2.5 rounded-full border text-[12px] uppercase tracking-[0.14em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  selected
                    ? "border-[var(--text-primary)] bg-[var(--text-primary)] text-[var(--background)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {cap}
              </motion.button>
            )
          })}
        </div>

        <motion.p
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-10 md:mt-12 max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]"
        >
          {active === "Resources" && "A unified catalogue of costumes, props, set pieces, lighting, sound, and scripts available across every connected school."}
          {active === "Inventory" && "Digitize your department’s storage with photos, conditions, locations, and categories so nothing is forgotten."}
          {active === "Collaboration" && "Connect drama teachers across your district to share notes, coordinate handoffs, and plan productions together."}
          {active === "Borrowing" && "Search, reserve, and request items from peer departments with clear availability and due dates."}
          {active === "Lending" && "List what your program can share, set expectations, and track what is out and when it returns."}
          {active === "Analytics" && "Understand utilization, peak seasons, and fulfillment trends to make better purchasing decisions."}
          {active === "District Management" && "Oversee schools, users, permissions, and reporting from a single administrative view."}
        </motion.p>
      </div>
    </SectionWrapper>
  )
}
