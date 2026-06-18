import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SectionWrapper, Eyebrow } from "./landing-primitives"

const CAPABILITIES: { name: string; copy: string }[] = [
  { name: "Resources", copy: "A unified catalogue of costumes, props, set pieces, lighting, sound, and scripts available across every connected school." },
  { name: "Inventory", copy: "Digitize your department’s storage with photos, conditions, locations, and categories so nothing is forgotten." },
  { name: "Collaboration", copy: "Connect drama teachers across your district to share notes, coordinate handoffs, and plan productions together." },
  { name: "Borrowing", copy: "Search, reserve, and request items from peer departments with clear availability and due dates." },
  { name: "Lending", copy: "List what your program can share, set expectations, and track what is out and when it returns." },
  { name: "Analytics", copy: "Understand utilization, peak seasons, and fulfillment trends to make better purchasing decisions." },
  { name: "District Management", copy: "Oversee schools, users, permissions, and reporting from a single administrative view." },
]

export function LandingFilters() {
  const [active, setActive] = useState(CAPABILITIES[0].name)
  const activeCap = CAPABILITIES.find((c) => c.name === active) ?? CAPABILITIES[0]

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
            const selected = active === cap.name
            return (
              <motion.button
                key={cap.name}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
                onClick={() => setActive(cap.name)}
                whileTap={{ scale: 0.96 }}
                className={`relative px-5 py-2.5 rounded-full border text-[12px] uppercase tracking-[0.14em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] ${
                  selected
                    ? "border-transparent text-[var(--background)]"
                    : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="capability-pill"
                    className="absolute inset-0 rounded-full bg-[var(--text-primary)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{cap.name}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="mt-10 md:mt-12 min-h-[5.5rem] md:min-h-[4.5rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-xl text-lg leading-relaxed text-[var(--text-secondary)]"
            >
              {activeCap.copy}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  )
}
