import { MotionConfig } from "framer-motion"
import { LandingNav } from "@/features/landing/components/landing-nav"
import { LandingHero } from "@/features/landing/components/landing-hero"
import { LandingFilters } from "@/features/landing/components/landing-filters"
import { LandingShowcase } from "@/features/landing/components/landing-showcase"
import { LandingMission } from "@/features/landing/components/landing-mission"
import { LandingImpact } from "@/features/landing/components/landing-impact"
import { LandingTrust } from "@/features/landing/components/landing-trust"
import { LandingTestimonial } from "@/features/landing/components/landing-testimonial"
import { LandingLogos } from "@/features/landing/components/landing-logos"
import { LandingContact } from "@/features/landing/components/landing-contact"
import { LandingFooter } from "@/features/landing/components/landing-footer"

/**
 * Public landing page for Clio.
 * Architecture-firm inspired layout: massive whitespace, strong grid,
 * editorial typography, restrained palette, theme-aware via CSS variables.
 */
export default function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="landing-root min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
        <LandingNav />
        <main>
          <LandingHero />
          <LandingFilters />
          <LandingShowcase />
          <LandingMission />
          <LandingImpact />
          <LandingTrust />
          <LandingTestimonial />
          <LandingLogos />
          <LandingContact />
        </main>
        <LandingFooter />
      </div>
    </MotionConfig>
  )
}
