const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'clio_items', // NOTE: existing uploads remain in calliope_items on Cloudinary — do not migrate, new uploads go here only.
    allowed_formats: ['jpg', 'png', 'webp'],
    // D1 (SAFETY-GATE): strip EXIF/IPTC/XMP — including GPS — from the STORED
    // original. Cloudinary retains metadata on the original by default and only
    // strips it from rendered derivatives; since we serve the original's
    // secure_url, the original must be stripped at ingest. `force_strip` is the
    // documented upload-time strip applied via this incoming transformation.
    // MUST be verified live (see runbook): upload a photo with known GPS EXIF
    // and confirm `exiftool` on the served asset shows no GPS.
    transformation:  [{ quality: 'auto', fetch_format: 'auto', flags: 'force_strip' }],
  },
});

// D2: defense-in-depth allowlist by reported MIME type. The authoritative
// content-sniff stays at Cloudinary (allowed_formats rejects forged/renamed
// files by actual content), but this rejects obvious non-images BEFORE bytes
// are streamed to Cloudinary, and turns a would-be opaque 500 into a clean 4xx.
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
  },
});

/**
 * Wraps `upload.array('images', max)` so multer/fileFilter rejections return a
 * clean JSON 4xx instead of falling through to the generic 500 handler (D2).
 */
function uploadImages(max = 5) {
  const handler = upload.array('images', max);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next();
      if (err instanceof multer.MulterError) {
        const msg =
          err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 10MB or smaller' :
          (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') ? `At most ${max} images are allowed` :
          'Invalid image upload';
        return res.status(400).json({ error: msg });
      }
      // fileFilter rejection (unsupported type) or other upload error.
      return res.status(400).json({ error: err.message || 'Invalid image upload' });
    });
  };
}

module.exports = { cloudinary, upload, uploadImages };
