import {
  loginHandler,
  refreshTokenHandler,
  registerHandler,
  revokeTokenHandler,
} from '@/controllers/auth.controller';
import { validateRequest } from '@/utils/validate-request';
import { loginSchema, refreshSchema, registerSchema, revokeSchema } from '@/validation/auth.schema';
import { Router } from 'express';

export const authRouter: Router = Router();

authRouter.post('/register', validateRequest({ body: registerSchema.shape.body }), registerHandler);
authRouter.post('/login', validateRequest({ body: loginSchema.shape.body }), loginHandler);
authRouter.post(
  '/refresh',
  validateRequest({ body: refreshSchema.shape.body }),
  refreshTokenHandler,
);
authRouter.post('/revoke', validateRequest({ body: revokeSchema.shape.body }), revokeTokenHandler);
