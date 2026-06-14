import { motion } from "framer-motion"

export function LandingTestimonial() {
  return (
    <section className="py-32 md:py-48 lg:py-56">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="block text-[6rem] md:text-[8rem] leading-none font-serif text-[var(--text-muted)] select-none"
            aria-hidden="true"
          >
            "
          </motion.span>

          <motion.blockquote
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl leading-snug font-light text-[var(--text-primary)] -mt-16 md:-mt-20"
          >
            Clio turned our storage closet into a shared asset for the entire district.
          </motion.blockquote>

          <motion.footer
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
            className="mt-12 md:mt-16"
          >
            <p className="text-base font-medium text-[var(--text-primary)]">Sarah Chen</p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Theatre Director, Newport High School
            </p>
          </motion.footer>
        </div>
      </div>
    </section>
  )
}
