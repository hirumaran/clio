import { Link } from "react-router-dom"

type NavItem =
  | { label: string; href: string }
  | { label: string; to: string }

const NAV: NavItem[] = [
  { label: "Platform", href: "#platform" },
  { label: "Impact", href: "#impact" },
  { label: "Contact", href: "#contact" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
]

export function LandingFooter() {
  return (
    <footer className="bg-[var(--foreground)] text-[var(--background)]">
      <div className="container py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-5">
            <p className="text-2xl font-medium tracking-tight">Clio</p>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed opacity-70">
              A shared resource library built for drama teachers, departments, and districts.
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-50 mb-6">Navigation</p>
            <ul className="space-y-4">
              {NAV.map((item) => (
                <li key={item.label}>
                  {"to" in item ? (
                    <Link
                      to={item.to}
                      className="text-[14px] opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="text-[14px] opacity-70 hover:opacity-100 transition-opacity"
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.22em] opacity-50 mb-6">Contact</p>
            <p className="text-[14px] opacity-70">hello@clio.app</p>
            <p className="mt-2 text-[14px] opacity-70">Seattle, Washington</p>
          </div>
        </div>

        <div className="mt-16 md:mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] opacity-50">
            &copy; {new Date().getFullYear()} Clio. All rights reserved.
          </p>
          <p className="text-[12px] opacity-50">Built for drama teachers.</p>
        </div>
      </div>
    </footer>
  )
}
