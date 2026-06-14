import { motion } from "framer-motion"

/**
 * Architectural showcase panel.
 * Clean geometric composition with no stock photography.
 */
export function LandingShowcase() {
  return (
    <section className="w-full">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
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
              <linearGradient id="showcase-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--background)" stopOpacity="0" />
                <stop offset="100%" stopColor="var(--background)" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            <rect width="1200" height="514" fill="url(#showcase-dots)" />

            <rect x="80" y="80" width="360" height="360" fill="none" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.4" />
            <rect x="420" y="80" width="360" height="360" fill="var(--bg-raised)" opacity="0.5" />
            <rect x="760" y="80" width="360" height="360" fill="none" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.4" />

            <line x1="420" y1="80" x2="420" y2="440" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />
            <line x1="780" y1="80" x2="780" y2="440" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />

            <rect x="100" y="100" width="80" height="80" fill="var(--bg-raised)" opacity="0.7" />
            <rect x="620" y="120" width="120" height="120" fill="var(--bg-raised)" opacity="0.7" />
            <rect x="940" y="180" width="160" height="160" fill="var(--bg-raised)" opacity="0.7" />

            <line x1="0" y1="440" x2="1200" y2="440" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />
          </svg>

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
