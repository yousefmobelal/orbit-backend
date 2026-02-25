import {
  getMeHandler,
  updateProfileHandler,
  deleteProfileHandler,
} from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { upload } from '@/utils/upload';
import { validateRequest } from '@/utils/validate-request';
import { updateProfileSchema, deleteProfileSchema } from '@/validation/user.schema';
import { Router } from 'express';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/me', getMeHandler);
userRouter.patch(
  '/me',
  upload.single('avatar'),
  validateRequest({ body: updateProfileSchema }),
  updateProfileHandler,
);
userRouter.delete('/me', validateRequest({ body: deleteProfileSchema }), deleteProfileHandler);
