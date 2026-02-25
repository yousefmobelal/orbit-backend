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

authRouter.post('/register', validateRequest({ body: registerSchema }), registerHandler);
authRouter.post('/login', validateRequest({ body: loginSchema }), loginHandler);
authRouter.post('/refresh', validateRequest({ body: refreshSchema }), refreshTokenHandler);
authRouter.post('/logout', validateRequest({ body: logoutSchema }), logoutHandler);
authRouter.post('/revoke', authenticate, revokeTokenHandler);
