import { Reveal } from "./landing-motion"
import { Container } from "./landing-primitives"

const SCHOOLS = [
  "Sammamish High",
  "Newport High",
  "Interlake High",
  "Big Picture School",
]

export function LandingLogos() {
  return (
    <section id="proof" className="border-y border-[var(--border-default)] py-12 sm:py-14">
      <Container>
        <Reveal>
          <p className="mb-9 text-center text-[13px] tracking-[-0.01em] text-[var(--text-muted)]">
            Built for{" "}
            <span className="font-medium text-[var(--text-secondary)]">Bellevue School District</span>{" "}
            — piloting with four drama departments
          </p>
        </Reveal>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-16">
          {SCHOOLS.map((s) => (
            <span
              key={s}
              className="select-none whitespace-nowrap text-[19px] font-semibold tracking-[-0.03em] text-[var(--text-primary)] opacity-45 transition-opacity duration-300 hover:opacity-100"
            >
              {s}
            </span>
          ))}
        </div>
      </Container>
    </section>
  )
}
