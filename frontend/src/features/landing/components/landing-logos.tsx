import { Marquee, Reveal } from "./landing-motion"
import { Container } from "./landing-primitives"

const SCHOOLS = [
  "Sammamish High",
  "Newport High",
  "Interlake High",
  "Big Picture School",
]

// Repeat the short list so a single marquee copy overfills wide/4K viewports —
// otherwise the seamless loop would expose a blank stretch on big screens.
const TICKER = [...SCHOOLS, ...SCHOOLS]

const BAND_TEXT =
  "py-3.5 text-[28px] font-bold uppercase leading-none tracking-[-0.01em] sm:py-4 sm:text-[36px]"

function SchoolNames() {
  return (
    <>
      {TICKER.map((s, i) => (
        <span key={i} className="select-none whitespace-nowrap">
          {s}
        </span>
      ))}
    </>
  )
}

export function LandingLogos() {
  return (
    <section
      id="proof"
      className="overflow-hidden border-y border-[var(--border-default)] py-12 sm:py-14"
    >
      <Container>
        <Reveal>
          <p className="mb-9 text-center text-[13px] tracking-[-0.01em] text-[var(--text-muted)]">
            Built for{" "}
            <span className="font-medium text-[var(--text-secondary)]">Bellevue School District</span>{" "}
            — piloting with four drama departments
          </p>
        </Reveal>
      </Container>

      {/* The pilot schools become a two-band stage marquee — an ember footlight
          bar over its own inverted ink/cream reflection, each scrolling against
          the other. Full-bleed so the bands run edge to edge like a theatre
          ticker. Both colours are page tokens, so they track the pull-chain. */}
      <Reveal delay={0.1}>
        <div>
          {/* ember band — runs right-to-left */}
          <div className="bg-[var(--ember)] text-[var(--stage)]">
            <Marquee speed={28} className={BAND_TEXT}>
              <SchoolNames />
            </Marquee>
          </div>

          {/* inverted band — same names mirrored, running the other way.
              A decorative echo of the band above, so it stays out of the
              reading order. */}
          <div aria-hidden className="bg-[var(--text-primary)] text-[var(--bg-base)]">
            <Marquee speed={28} reverse className={BAND_TEXT}>
              <SchoolNames />
            </Marquee>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
