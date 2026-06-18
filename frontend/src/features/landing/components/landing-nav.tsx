import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import { LandingLinkButton } from "./landing-primitives"
import { useScrollSpy } from "./landing-motion"

const LINKS = [
  { label: "Platform", href: "#platform", id: "platform" },
  { label: "Impact", href: "#impact", id: "impact" },
  { label: "Contact", href: "#contact", id: "contact" },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)
  const active = useScrollSpy(LINKS.map((l) => l.id))

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="landing-nav fixed top-0 left-0 right-0 z-50"
    >
      <nav className="container relative flex items-center justify-between py-5">
        {/* Wordmark — the name is the brand */}
        <Link
          to="/"
          className="text-[18px] font-semibold tracking-[-0.04em] text-[var(--text-primary)]"
        >
          clio
        </Link>

        {/* Floating pill — centered on the canvas, no shadow */}
        <ul className="landing-pill absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:flex items-center p-1.5">
          {LINKS.map((link) => {
            const isActive = active === link.id
            return (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`flex items-center gap-1.5 rounded-[20px] px-4 py-2 text-[12px] tracking-[-0.01em] transition-colors ${
                    isActive
                      ? "text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-[var(--primary)] transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                  {link.label}
                </a>
              </li>
            )
          })}
        </ul>

        <div className="flex items-center gap-2">
          <LandingLinkButton to="/login" variant="ghost" className="hidden sm:inline-flex !px-3 !py-2">
            Sign in
          </LandingLinkButton>
          <LandingLinkButton to="/signup" variant="outline" className="hidden sm:inline-flex !px-4 !py-2">
            Get started
          </LandingLinkButton>
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
            className="md:hidden overflow-hidden border-t border-[var(--border-subtle)] bg-[var(--background)]"
          >
            <ul className="container flex flex-col gap-1 py-4">
              {LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 py-3 text-[13px] tracking-[-0.01em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {active === link.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
                    )}
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
