import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { LandingLinkButton } from "./landing-primitives"

const LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
]

export function LandingNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="landing-nav fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-md"
    >
      <nav className="container flex h-14 items-center justify-between">
        <Link to="/" className="text-[18px] font-medium tracking-tight text-[var(--text-primary)]">
          Clio
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <LandingLinkButton to="/login" variant="ghost" className="hidden sm:inline-flex !px-4 !py-2">
            Sign in
          </LandingLinkButton>
          <LandingLinkButton to="/signup" variant="primary" className="!px-4 !py-2">
            Get started
          </LandingLinkButton>
        </div>
      </nav>
    </motion.header>
  )
}
