import { env } from '@/config/env';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET: Secret = env.JWT_SECRET;
const REFRESH_TOKEN_SECRET: Secret = env.JWT_REFRESH_SECRET;
const ACCESS_OPTIONS = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
const REFRESH_OPTIONS = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'] };

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export interface RefreshTokenPayload {
  sub: string;
  tokenId: string;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, ACCESS_TOKEN_SECRET, ACCESS_OPTIONS);
};

export const signRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, REFRESH_OPTIONS);
};

export const verifyRefreshToken = (payload: string): RefreshTokenPayload => {
  return jwt.verify(payload, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
};
