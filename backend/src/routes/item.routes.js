const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken: requireAuth } = require('../middleware/auth');
const { uploadImages } = require('../config/cloudinary');
const {
  getItems,
  getItemById,
  createItem,
  deleteItem,
  updateItem,
  addItemImages,
  deleteItemImage,
} = require('../controllers/item.controller');

const router = express.Router();

// Per-user limiter on the upload endpoints (H3): these are the highest unit-cost
// routes (multipart + Cloudinary). Keyed by user id since they're authenticated.
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.UPLOAD_RATE_LIMIT_MAX) || 40,
  keyGenerator: (req) => String(req.user?.userId ?? req.ip),
  message: { error: 'Too many uploads, try again later' },
});

router.get('/', getItems);
router.get('/:id', getItemById);
router.post('/', requireAuth, uploadLimiter, uploadImages(5), createItem);
router.patch('/:id', requireAuth, updateItem);
router.delete('/:id', requireAuth, deleteItem);

router.post('/:id/images', requireAuth, uploadLimiter, uploadImages(5), addItemImages);
router.delete('/:id/images/:imageId', requireAuth, deleteItemImage);

module.exports = router;
