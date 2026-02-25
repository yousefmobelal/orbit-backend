import User from '@/models/user.model';
import {
  getMe,
  updateProfile,
  uploadAvatarToCloudinary,
  deleteProfile,
} from '@/services/user.service';
import { UserType, UpdateProfileInput } from '@/types/user';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { ResponseStatus } from '@/types/response';
import { DeleteProfileInput } from '@/validation/user.schema';

export const getMeHandler = asyncHandler(async (req, res) => {
  const currentUser: UserType = await getMe(req.user.id);
  res.json({
    status: ResponseStatus.SUCCESS,
    data: currentUser,
  });
});

export const updateProfileHandler = asyncHandler(async (req, res) => {
  const updatedUser = await updateProfile({
    userId: req.user.id,
    name: req.body.name,
    file: req.file,
  });

  res.json({
    status: ResponseStatus.SUCCESS,
    data: updatedUser,
  });
});

export const deleteProfileHandler = asyncHandler(async (req, res) => {
  const { password } = req.body as DeleteProfileInput;

  await deleteProfile(req.user.id, password);

  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    message: 'Your account has been successfully deleted',
  });
});
