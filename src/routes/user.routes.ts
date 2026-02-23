import { getMeHandler, updateProfileHandler } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { upload } from '@/utils/upload';
import { validateRequest } from '@/utils/validate-request';
import { updateProfileSchema } from '@/validation/user.schema';
import { Router } from 'express';

export const userRouter = Router();

userRouter.get('/me', authenticate, getMeHandler);
userRouter.patch(
  '/me',
  authenticate,
  upload.single('avatar'),
  validateRequest({ body: updateProfileSchema.shape.body }),
  updateProfileHandler,
);
