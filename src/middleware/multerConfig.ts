import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${timestamp}${ext}`);
  },
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['text/csv', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedExts = ['.csv', '.txt', '.docx'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Check by extension as fallback
  if (!allowedMimes.includes(mime)) {
    if (!allowedExts.includes(ext)) {
      return cb(new Error(`Invalid file type. Allowed types: CSV, TXT, DOCX`));
    }
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});
