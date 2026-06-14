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
