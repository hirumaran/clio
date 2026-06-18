import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence, useMotionValueEvent, useScroll } from "framer-motion"
import { Menu, X } from "lucide-react"
import { LandingLinkButton } from "./landing-primitives"
import { Magnetic, useScrollSpy } from "./landing-motion"

const LINKS = [
  { label: "Platform", href: "#platform", id: "platform" },
  { label: "Impact", href: "#impact", id: "impact" },
  { label: "Contact", href: "#contact", id: "contact" },
]

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const active = useScrollSpy(LINKS.map((l) => l.id))

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24))

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`landing-nav fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-[var(--border-subtle)] bg-[var(--background)]/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <nav className={`container flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
        <Link to="/" className="text-[18px] font-medium tracking-tight text-[var(--text-primary)]">
          Clio
        </Link>

        <ul className="hidden md:flex items-center gap-10">
          {LINKS.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`relative text-[11px] uppercase tracking-[0.18em] transition-colors ${
                  active === link.id ? "text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {link.label}
                {active === link.id && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-[var(--primary)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <LandingLinkButton to="/login" variant="ghost" className="hidden sm:inline-flex !px-4 !py-2">
            Sign in
          </LandingLinkButton>
          <Magnetic strength={0.3} className="hidden sm:inline-block">
            <LandingLinkButton to="/signup" variant="primary" className="!px-4 !py-2">
              Get started
            </LandingLinkButton>
          </Magnetic>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center text-[var(--text-primary)]"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--background)]/95 backdrop-blur-md"
          >
            <ul className="container flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-[12px] uppercase tracking-[0.18em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <LandingLinkButton to="/login" variant="ghost" className="!px-0">
                  Sign in
                </LandingLinkButton>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
