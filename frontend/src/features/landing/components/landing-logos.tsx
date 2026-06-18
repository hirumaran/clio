import { Eyebrow } from "./landing-primitives"
import { Marquee } from "./landing-motion"

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
      </div>
      <Marquee speed={32} className="[mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
        {PARTNERS.map((name) => (
          <span
            key={name}
            className="school-watermark shrink-0 text-lg md:text-xl text-[var(--text-muted)] transition-opacity duration-300 hover:!opacity-100"
          >
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  )
}
