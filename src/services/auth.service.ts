import RefreshToken from '@/models/refreshToken.model';
import User from '@/models/user.model';
import { AuthTokens, LoginInput, RegisterInput } from '@/types/auth';
import { HttpError } from '@/utils/http-error';
import { logger } from '@/utils/logger';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/token';
import crypto from 'crypto';

export const refreshTokens = async (token: string): Promise<AuthTokens> => {
  const payload = verifyRefreshToken(token);
  const refreshToken = await RefreshToken.findOne({
    tokenId: payload.tokenId,
    userId: payload.sub,
  });
  if (!refreshToken) {
    throw new HttpError('Invalid refresh token', 401);
  }
  if (refreshToken.expiresAt < new Date()) {
    await refreshToken.deleteOne();
    throw new HttpError('Refresh token expired', 401);
  }

  const credentials = await User.findById(payload.sub);
  if (!credentials) {
    logger.warn({ userId: payload.sub }, 'User is missing for refresh token');

    await refreshToken.deleteOne();
    throw new HttpError('User not found', 404);
  }

  await refreshToken.deleteOne();
  const newRefreshToken = await createRefreshToken(payload.sub);
  return {
    accessToken: signAccessToken({ sub: credentials._id.toString(), email: credentials.email }),
    refreshToken: signRefreshToken({
      sub: credentials._id.toString(),
      tokenId: newRefreshToken.tokenId,
    }),
  };
};

export const revokeRefreshToken = async (userId: string) => {
  await RefreshToken.deleteMany({ userId });
};

export const logout = async (token: string): Promise<void> => {
  const payload = verifyRefreshToken(token);
  await RefreshToken.deleteOne({
    tokenId: payload.tokenId,
    userId: payload.sub,
  });
};

export const register = async (input: RegisterInput): Promise<AuthTokens> => {
  try {
    const isUserExists = await User.exists({ email: input.email });
    if (isUserExists) {
      throw new HttpError('Email already in use', 409);
    }
    const user = await User.create(input);
    const refreshToken = await createRefreshToken(user._id.toString());
    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const signedRefreshToken = signRefreshToken({
      sub: user._id.toString(),
      tokenId: refreshToken.tokenId,
    });
    return {
      accessToken,
      refreshToken: signedRefreshToken,
    };
  } catch (error) {
    throw error;
  }
};

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const user = await User.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw new HttpError('Invalid email or password', 401);
  }

  const isPasswordCorrect = await user.correctPassword(input.password, user.password);
  if (!isPasswordCorrect) {
    throw new HttpError('Invalid email or password', 401);
  }

  const refreshToken = await createRefreshToken(user._id.toString());
  const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
  const signedRefreshToken = signRefreshToken({
    sub: user._id.toString(),
    tokenId: refreshToken.tokenId,
  });

  return {
    accessToken,
    refreshToken: signedRefreshToken,
  };
};

const REFRESH_TOKEN_TTL_DAYS = 30;
const MAX_ACTIVE_SESSIONS = 5;

const limitActiveSessions = async (userId: string) => {
  const tokenCount = await RefreshToken.countDocuments({ userId });
  if (tokenCount >= MAX_ACTIVE_SESSIONS) {
    const tokensToDelete = tokenCount - MAX_ACTIVE_SESSIONS + 1;
    const oldestTokens = await RefreshToken.find({ userId })
      .sort({ createdAt: 1 })
      .limit(tokensToDelete);
    await RefreshToken.deleteMany({
      _id: { $in: oldestTokens.map((t) => t._id) },
    });
  }
};

const createRefreshToken = async (userId: string) => {
  await limitActiveSessions(userId);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
  const tokenId = crypto.randomUUID();
  const refreshToken = await RefreshToken.create({ userId, tokenId, expiresAt });
  return refreshToken;
};
