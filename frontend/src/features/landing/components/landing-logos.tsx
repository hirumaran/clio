import { Marquee, Reveal } from "./landing-motion"
import { Container, Eyebrow } from "./landing-primitives"

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
    <section id="proof" className="overflow-hidden py-16 sm:py-20">
      <Container>
        <Reveal className="flex flex-col items-center gap-3 text-center">
          <Eyebrow>Now piloting</Eyebrow>
          <p className="text-[15px] tracking-[-0.01em] text-[var(--text-secondary)] sm:text-[16px]">
            Built for{" "}
            <span className="font-medium text-[var(--text-primary)]">Bellevue School District</span>
            <span className="text-[var(--text-muted)]"> — four drama departments</span>
          </p>
        </Reveal>
      </Container>

      {/* The pilot schools become a two-band stage marquee — an ember footlight
          bar over its own inverted ink/cream reflection, each scrolling against
          the other. Full-bleed so the bands run edge to edge like a theatre
          ticker. Both colours are page tokens, so they track the pull-chain. */}
      <Reveal delay={0.1} className="relative mt-11 sm:mt-12">
        {/* A soft ember footlight lifts the bands off the page — this replaces
            the old hairline rules that used to bracket the section. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-52 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(60% 120% at 50% 50%, color-mix(in srgb, var(--ember) 13%, transparent), transparent 72%)",
          }}
        />
        <div className="relative">
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
