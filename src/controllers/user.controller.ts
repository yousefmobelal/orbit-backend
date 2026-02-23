import User from '@/models/user.model';
import { getMe, updateProfile, uploadAvatarToCloudinary } from '@/services/user.service';
import { UserType, UpdateProfileInput } from '@/types/user';
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

export const updateProfileHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const input: UpdateProfileInput = {};

  // Handle name update
  if (req.body.name) {
    input.name = req.body.name;
  }

  // Handle avatar upload
  if (req.file) {
    if (!req.file.path) {
      throw new HttpError('File upload failed', 400);
    }

    // Upload to Cloudinary
    input.avatar = await uploadAvatarToCloudinary(req.file.path);
  }

  // Update profile (service handles old avatar deletion)
  const user: UserType = await updateProfile(req.user._id.toString(), input);

  res.json({
    status: ResponseStatus.SUCCESS,
    data: user,
  });
});
