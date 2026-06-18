import { forwardRef, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { motion, type HTMLMotionProps } from "framer-motion"

type ButtonVariant = "primary" | "outline" | "ghost"

interface LandingButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant
  asLink?: boolean
  to?: string
  children: ReactNode
}

const baseClasses =
  "inline-flex items-center justify-center rounded-[4px] text-[13px] tracking-[-0.01em] font-medium px-6 py-3 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--text-secondary)]",
  outline:
    "border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--text-primary)]",
  ghost:
    "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
}

export const LandingButton = forwardRef<HTMLButtonElement, LandingButtonProps>(
  ({ variant = "primary", asLink, to, children, className = "", ...props }, ref) => {
    const classes = `${baseClasses} ${variantClasses[variant]} ${className}`

    if (asLink && to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      )
    }

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        transition={{ duration: 0.2 }}
        className={classes}
        {...props}
      >
        {children}
      </motion.button>
    )
  }
)
LandingButton.displayName = "LandingButton"

interface LandingLinkButtonProps {
  to: string
  variant?: ButtonVariant
  children: ReactNode
  className?: string
}

export const LandingLinkButton = ({
  to,
  variant = "primary",
  children,
  className = "",
}: LandingLinkButtonProps) => {
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  return (
    <Link to={to} className={classes}>
      {children}
    </Link>
  )
}

export const LandingInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full bg-transparent border-b border-[var(--border-default)] px-0 py-3 text-[16px] tracking-[-0.01em] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--primary)] focus:outline-none transition-colors ${className}`}
        {...props}
      />
    )
  }
)
LandingInput.displayName = "LandingInput"

export const LandingLabel = ({ children, htmlFor, className = "" }: { children: ReactNode; htmlFor?: string; className?: string }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[12px] tracking-[-0.01em] text-[var(--text-muted)] mb-2 ${className}`}
    >
      {children}
    </label>
  )
}

type SectionWrapperProps = React.HTMLAttributes<HTMLElement> & { children: ReactNode }

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  ({ children, className = "", ...props }, ref) => {
    return (
      <section ref={ref} className={`py-24 md:py-36 lg:py-44 ${className}`} {...props}>
        {children}
      </section>
    )
  }
)
SectionWrapper.displayName = "SectionWrapper"

export const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <p className={`text-[13px] tracking-[-0.01em] font-medium text-[var(--primary)] ${className}`}>
      {children}
    </p>
  )
}
