import { useState, type FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { SectionWrapper, LandingButton, LandingInput, LandingLabel } from "./landing-primitives"
import { submitContactForm, type ContactFormData } from "../lib/contact"

export function LandingContact() {
  const [form, setForm] = useState<ContactFormData>({
    name: "",
    email: "",
    organization: "",
    role: "",
    message: "",
  })
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({
    type: "idle",
  })

  const handleChange = (field: keyof ContactFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus({ type: "loading" })
    const result = await submitContactForm(form)
    if (result.ok) {
      setStatus({ type: "success", message: "Thank you. We will be in touch within one school day." })
      setForm({ name: "", email: "", organization: "", role: "", message: "" })
    } else {
      setStatus({ type: "error", message: result.error || "Something went wrong. Please try again." })
    }
  }

  return (
    <SectionWrapper id="contact" className="relative overflow-hidden py-32 md:py-44 border-t border-[var(--border-default)]">
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 1200 600"
          className="absolute inset-0 w-full h-full opacity-[0.08]"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <pattern id="contact-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <rect width="32" height="32" fill="transparent" />
              <circle cx="1" cy="1" r="1" fill="var(--text-primary)" />
            </pattern>
          </defs>
          <rect width="1200" height="600" fill="url(#contact-grid)" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="text-4xl md:text-6xl lg:text-7xl leading-[1.0] tracking-tight font-light text-[var(--text-primary)]">
              Ready to transform your district?
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-[var(--text-secondary)] max-w-md">
              Tell us about your program and we will help you get Clio running across your schools.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="bg-[var(--bg-raised)] border border-[var(--border-default)] p-8 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <LandingLabel htmlFor="contact-name">Name</LandingLabel>
                  <LandingInput
                    id="contact-name"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <LandingLabel htmlFor="contact-email">Email</LandingLabel>
                  <LandingInput
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    placeholder="you@school.edu"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <LandingLabel htmlFor="contact-organization">School / District</LandingLabel>
                  <LandingInput
                    id="contact-organization"
                    value={form.organization}
                    onChange={handleChange("organization")}
                    placeholder="District or school name"
                    required
                  />
                </div>
                <div>
                  <LandingLabel htmlFor="contact-role">Role</LandingLabel>
                  <LandingInput
                    id="contact-role"
                    value={form.role}
                    onChange={handleChange("role")}
                    placeholder="Theatre director, admin, etc."
                    required
                  />
                </div>
              </div>

              <div>
                <LandingLabel htmlFor="contact-message">Project needs</LandingLabel>
                <textarea
                  id="contact-message"
                  value={form.message}
                  onChange={handleChange("message")}
                  placeholder="Describe your inventory or collaboration goals"
                  rows={4}
                  required
                  className="w-full bg-transparent border-b border-[var(--border-default)] px-0 py-3 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--text-primary)] focus:outline-none transition-colors resize-none"
                />
              </div>

              <LandingButton
                type="submit"
                variant="primary"
                className="w-full md:w-auto group"
                disabled={status.type === "loading"}
              >
                {status.type === "loading" ? "Sending..." : "Request a consultation"}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
              </LandingButton>

              <AnimatePresence mode="wait">
                {status.type === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 text-sm text-[var(--status-success)]"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span>{status.message}</span>
                  </motion.div>
                )}
                {status.type === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-3 text-sm text-[var(--status-error)]"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                    <span>{status.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  )
}
