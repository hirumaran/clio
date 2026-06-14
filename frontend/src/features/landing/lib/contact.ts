export interface ContactFormData {
  name: string
  email: string
  organization: string
  role: string
  message: string
}

export interface ContactResult {
  ok: boolean
  error?: string
}

/**
 * Submits the landing-page contact form to the Clio API.
 * Replace the endpoint or payload shape here if the contract changes.
 */
export async function submitContactForm(data: ContactFormData): Promise<ContactResult> {
  try {
    const response = await fetch("/api/v1/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const message = await response.text().catch(() => "Submission failed")
      return { ok: false, error: message || `Error ${response.status}` }
    }

    return { ok: true }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Network error. Please try again.",
    }
  }
}
