import User from '@/models/user.model';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { verifyAccessToken } from '@/utils/token';
import { Request, Response, NextFunction } from 'express';

export const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError('Authentication required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new HttpError('Authentication required', 401);
    }

    try {
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub);
      if (!user) {
        throw new HttpError('User not found', 401);
      }

      req.user = { id: user._id.toString(), email: user.email };
      next();
    } catch (error) {
      throw new HttpError('Invalid or expired token', 401);
    }
  },
);
