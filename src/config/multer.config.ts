// في ملف config/multer.config.ts
import { memoryStorage } from 'multer'; // استخدم memoryStorage بدلاً من diskStorage

export const multerConfig = {
  storage: memoryStorage(), // ✅ مهم جداً: استخدم memoryStorage
  limits: {
    fileSize: 50 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png|gif|mp4|mov|avi|webm)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  },
};
