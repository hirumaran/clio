import { motion } from "framer-motion"

const EASE = [0.22, 1, 0.36, 1] as const
const QUOTE = "Clio turned our storage closet into a shared asset for the entire district."

export function LandingTestimonial() {
  const words = QUOTE.split(" ")

  return (
    <section className="py-32 md:py-48 lg:py-56">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="block text-[6rem] md:text-[8rem] leading-none tracking-[-0.04em] text-[var(--primary)] opacity-50 select-none"
            aria-hidden="true"
          >
            &ldquo;
          </motion.span>

          <blockquote className="text-2xl md:text-4xl lg:text-5xl leading-snug font-light text-[var(--text-primary)] -mt-16 md:-mt-20">
            <motion.span
              className="inline"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.045 }}
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  className="inline-block"
                  variants={{
                    hidden: { opacity: 0, y: "0.4em" },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.span>
          </blockquote>

          <motion.footer
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
            className="mt-12 md:mt-16"
          >
            <p className="text-base font-medium text-[var(--text-primary)]">Sarah Chen</p>
            <p className="mt-1 text-[13px] tracking-[-0.01em] text-[var(--text-muted)]">
              Theatre Director, Newport High School
            </p>
          </motion.footer>
        </div>
      </div>
    </section>
  )
}
