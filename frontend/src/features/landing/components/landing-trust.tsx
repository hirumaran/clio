import { motion } from "framer-motion"
import { SectionWrapper, Eyebrow } from "./landing-primitives"
import { CountUp } from "./landing-motion"

const SUPPORT_METRICS = [
  { value: "24h", label: "Average response" },
  { value: "99.9%", label: "Uptime" },
  { value: "100+", label: "Districts ready" },
]

export function LandingTrust() {
  return (
    <SectionWrapper>
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <Eyebrow className="mb-6">Enterprise trust</Eyebrow>
            <CountUp
              value="98%"
              duration={2}
              className="block text-[8rem] md:text-[12rem] lg:text-[16rem] leading-[0.85] font-light tracking-tighter text-[var(--text-primary)]"
            />
            <p className="mt-6 text-xl md:text-2xl leading-relaxed text-[var(--text-secondary)] max-w-lg">
              Of resource requests are successfully fulfilled when schools share inventory through Clio.
            </p>
          </motion.div>

          <div className="lg:col-span-5 flex flex-col justify-end">
            <div className="border-t border-[var(--border-default)]">
              {SUPPORT_METRICS.map((metric, i) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
                  className="group flex items-baseline justify-between py-8 border-b border-[var(--border-default)] transition-colors hover:border-[var(--primary)]"
                >
                  <CountUp
                    value={metric.value}
                    className="text-3xl md:text-4xl font-light tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--primary)]"
                  />
                  <span className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    {metric.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
