const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]);

const allowedExtensions = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx'
]);

function safeBaseName(fileName) {
  return path
    .basename(fileName, path.extname(fileName))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'arquivo';
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${unique}-${safeBaseName(file.originalname)}${ext}`);
  }
});

module.exports = multer({
  storage,
  limits: {
    fileSize: Number(process.env.UPLOAD_MAX_BYTES || 8 * 1024 * 1024)
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(ext)) {
      return cb(new Error('Tipo de arquivo nao permitido.'));
    }
    cb(null, true);
  }
});
