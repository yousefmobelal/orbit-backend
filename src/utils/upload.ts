import { HttpError } from '@/utils/http-error';
import multer from 'multer';

export const upload = multer({
  storage: multer.diskStorage({}),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      const httpError = new HttpError('This field only accepts image!', 400);
      return cb(httpError as any, false);
    }

    return cb(null, true);
  },
});
