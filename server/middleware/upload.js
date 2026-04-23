const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// ─── Gig image storage ────────────────────────────────────────────────────────
const gigImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freelancer_mp/gigs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// ─── Delivery file storage ────────────────────────────────────────────────────
const deliveryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freelancer_mp/deliveries',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'zip', 'mp4', 'mov', 'psd', 'ai', 'fig'],
  },
});

// ─── Avatar storage ───────────────────────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'freelancer_mp/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf'
    || file.mimetype === 'application/zip' || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

exports.uploadGigImages = multer({
  storage: gigImageStorage,
  limits: { fileSize: 10 * 1024 * 1024 },   // 10MB
  fileFilter,
}).array('images', 5);

exports.uploadDelivery = multer({
  storage: deliveryStorage,
  limits: { fileSize: 100 * 1024 * 1024 },   // 100MB
  fileFilter,
}).array('files', 10);

exports.uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 },   // 5MB
  fileFilter,
}).single('avatar');
