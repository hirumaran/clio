const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured — emails disabled');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT ?? '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendPasswordResetEmail(toEmail, resetToken) {
  const t = getTransporter();
  if (!t) return { skipped: true };

  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  const mobileDeepLink =
    `skene://reset-password?token=${resetToken}`;

  await t.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@skene.app',
    to: toEmail,
    subject: 'Reset your Skēnē password',
    text: `Reset your password: ${resetUrl}`,
    html: `
      <p>You requested a password reset for your Skēnē account.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you're on mobile, open this link:
         <a href="${mobileDeepLink}">${mobileDeepLink}</a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  });

  return { sent: true };
}

module.exports = { sendPasswordResetEmail };
