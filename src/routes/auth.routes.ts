import {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerHandler,
  revokeTokenHandler,
} from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRequest } from '@/utils/validate-request';
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from '@/validation/auth.schema';
import { Router } from 'express';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({ body: registerSchema.shape.body }), registerHandler);
authRouter.post('/login', validateRequest({ body: loginSchema.shape.body }), loginHandler);
authRouter.post(
  '/refresh',
  validateRequest({ body: refreshSchema.shape.body }),
  refreshTokenHandler,
);
authRouter.post('/logout', validateRequest({ body: logoutSchema.shape.body }), logoutHandler);
authRouter.post('/revoke', authenticate, revokeTokenHandler);
