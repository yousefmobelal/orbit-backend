import User from '@/models/user.model';
import { getMe } from '@/services/user.service';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';

export const getMeHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }
  const user = await getMe(req.user._id.toString());
  res.json({ data: user });
});
