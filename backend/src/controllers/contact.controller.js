const { sendContactSubmissionEmail } = require('../utils/email');

/**
 * POST /api/v1/contact
 */
async function submitContact(req, res) {
  try {
    const { name, email, organization, role, message } = req.body;

    if (!name || !email || !organization || !role || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // E2: reject CR/LF in any value that reaches an email header (subject =
    // name+organization, reply-to = email). nodemailer v8 already collapses
    // these, but guarding at the boundary means header safety doesn't silently
    // depend on a transitive dependency's behavior surviving a future bump.
    if ([name, organization, role].some((v) => /[\r\n]/.test(String(v)))) {
      return res.status(400).json({ error: 'Invalid characters in submission' });
    }
    // Cap lengths to bound abuse / email size.
    if (name.length > 200 || organization.length > 200 || role.length > 100 || message.length > 5000) {
      return res.status(400).json({ error: 'A field exceeds the maximum allowed length' });
    }

    const result = await sendContactSubmissionEmail({
      name,
      email,
      organization,
      role,
      message,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[Contact] Submit error:', err);
    return res.status(500).json({ error: 'Failed to send contact submission' });
  }
}

module.exports = { submitContact };
