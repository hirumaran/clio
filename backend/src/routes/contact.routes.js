const express = require('express');
const rateLimit = require('express-rate-limit');
const { submitContact } = require('../controllers/contact.controller');

const router = express.Router();

// Public + side-effectful (sends an email per call) -> rate-limit per IP to
// prevent email-flooding / SMTP-cost / sender-reputation abuse.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many contact submissions, try again later' },
});

router.post('/', contactLimiter, submitContact);

module.exports = router;
