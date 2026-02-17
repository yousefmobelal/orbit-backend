import { getMeHandler } from '@/controllers/user.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { Router } from 'express';

export const userRouter = Router();

userRouter.get('/me', authenticate, getMeHandler);
