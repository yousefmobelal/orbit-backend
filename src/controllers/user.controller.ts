import User from '@/models/user.model';
import { getMe } from '@/services/user.service';
import { UserType } from '@/types/user';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { ResponseStatus } from '@/types/response';

export const getMeHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }
  const user: UserType = await getMe(req.user._id.toString());
  res.json({
    status: ResponseStatus.SUCCESS,
    data: user,
  });
});
