import {
  login,
  logout,
  refreshTokens,
  register,
  revokeRefreshToken,
} from '@/services/auth.service';
import { LoginInput, RegisterInput, AuthTokens } from '@/types/auth';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { ResponseStatus } from '@/types/response';

export const loginHandler = asyncHandler(async (req, res) => {
  const payload = req.body as LoginInput;
  const tokens: AuthTokens = await login(payload);
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: tokens,
  });
});

export const registerHandler = asyncHandler(async (req, res) => {
  const payload = req.body as RegisterInput;
  const tokens: AuthTokens = await register(payload);
  res.status(201).json({
    status: ResponseStatus.SUCCESS,
    data: tokens,
  });
});

export const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new HttpError('Refresh token is required', 400);
  }
  const tokens: AuthTokens = await refreshTokens(refreshToken);
  res.json({
    status: ResponseStatus.SUCCESS,
    data: tokens,
  });
});

export const logoutHandler = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body as { refreshToken?: string };
  if (!refreshToken) {
    throw new HttpError('Refresh token is required', 400);
  }
  await logout(refreshToken);
  res.status(204).send();
});

export const revokeTokenHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }
  await revokeRefreshToken(req.user._id.toString());
  res.status(204).send();
});
