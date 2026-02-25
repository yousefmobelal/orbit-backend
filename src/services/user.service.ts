import User from '@/models/user.model';
import Task from '@/models/task.model';
import Planet from '@/models/planet.model';
import Narrative from '@/models/narrative.model';
import RefreshToken from '@/models/refreshToken.model';
import { UserLevelUpEvent, UserType } from '@/types/user';
import { HttpError } from '@/utils/http-error';
import { calculateUserXPForNextLevel } from '@/config/progression';
import cloudinaryV2 from '@/config/cloudinary';
import mongoose, { ClientSession } from 'mongoose';
import { logger } from '@/utils/logger';

export const updateUserGlobalStreak = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastActiveDate) {
    // First completion ever
    user.globalStreak = 1;
    user.lastActiveDate = new Date();
  } else {
    const lastActive = new Date(user.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Yesterday - increment streak
      user.globalStreak += 1;
      user.lastActiveDate = new Date();
    } else if (diffDays > 1) {
      // Gap > 1 day - reset streak
      user.globalStreak = 1;
      user.lastActiveDate = new Date();
    }
    // If diffDays === 0 (same day), no changes needed - streak maintained
  }

  await user.save();
};

export const addGlobalXP = async (
  userId: string,
  xpAmount: number,
  session: ClientSession | null,
): Promise<{ user: any; levelUpEvent: UserLevelUpEvent | null }> => {
  const user = await User.findById(userId).session(session);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  user.globalXP += xpAmount;

  if (user.globalXP < 0) {
    if (user.globalLevel === 1) {
      user.globalXP = 0;
    } else {
      user.globalLevel--;
      user.globalXP += calculateUserXPForNextLevel(user.globalLevel);
    }
  }

  let levelUpEvent: UserLevelUpEvent | null = null;
  const requiredXP = calculateUserXPForNextLevel(user.globalLevel);

  if (user.globalXP >= requiredXP) {
    const previousLevel = user.globalLevel;
    user.globalLevel++;
    user.globalXP -= requiredXP;

    levelUpEvent = {
      userId: user._id.toString(),
      previousLevel,
      newLevel: user.globalLevel,
      totalXP: user.globalXP,
    };
  }

  await user.save({ session });

  return { user, levelUpEvent };
};

export const getMe = async (userId: string): Promise<UserType> => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new HttpError('User not found', 404);
    }
    const requiredXPForNextLevel = calculateUserXPForNextLevel(user.globalLevel);
    const xpToNextLevel = Math.max(0, requiredXPForNextLevel - user.globalXP);
    const xpProgressPercent =
      requiredXPForNextLevel > 0 ? user.globalXP / requiredXPForNextLevel : 0;
    return {
      id: user._id.toString(),
      name: user.name,
      avatar: user.avatar,
      email: user.email,
      globalStreak: user.globalStreak,
      lastActiveDate: user.lastActiveDate,
      globalXP: user.globalXP,
      globalLevel: user.globalLevel,
      requiredXPForNextLevel,
      xpToNextLevel,
      xpProgressPercent,
      hasCreatedFirstTask: user.hasCreatedFirstTask,
    };
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async ({
  userId,
  name,
  file,
}: {
  userId: string;
  name?: string;
  file?: Express.Multer.File;
}): Promise<UserType> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  if (name !== undefined) {
    user.name = name;
  }

  if (file) {
    if (!file.path) {
      throw new HttpError('File upload failed', 400);
    }

    const uploadedAvatar = await uploadAvatarToCloudinary(file.path);

    if (user.avatar?.public_id) {
      try {
        await cloudinaryV2.uploader.destroy(user.avatar.public_id);
      } catch (error) {
        console.error('Failed to delete old avatar:', error);
      }
    }

    user.avatar = uploadedAvatar;
  }

  await user.save();

  const requiredXPForNextLevel = calculateUserXPForNextLevel(user.globalLevel);
  const xpToNextLevel = Math.max(0, requiredXPForNextLevel - user.globalXP);
  const xpProgressPercent = requiredXPForNextLevel > 0 ? user.globalXP / requiredXPForNextLevel : 0;

  return {
    id: user._id.toString(),
    name: user.name,
    avatar: user.avatar,
    email: user.email,
    globalStreak: user.globalStreak,
    lastActiveDate: user.lastActiveDate,
    globalXP: user.globalXP,
    globalLevel: user.globalLevel,
    requiredXPForNextLevel,
    xpToNextLevel,
    xpProgressPercent,
    hasCreatedFirstTask: user.hasCreatedFirstTask,
  };
};
export const uploadAvatarToCloudinary = async (
  filePath: string,
): Promise<{ url: string; public_id: string }> => {
  try {
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: 'avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
      ],
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);

    if (error.message?.includes('Invalid Signature')) {
      throw new HttpError('Image upload configuration error. Please contact support.', 500);
    }

    throw new HttpError(error.message || 'Failed to upload image', 500);
  }
};

export const deleteProfile = async (userId: string, password: string): Promise<void> => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    throw new HttpError('Incorrect password', 401);
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    await Promise.all([
      RefreshToken.deleteMany({ userId }).session(session),
      Task.deleteMany({ userId }).session(session),
      Planet.deleteMany({ userId }).session(session),
      Narrative.deleteMany({ userId }).session(session),
      User.findByIdAndDelete(userId).session(session),
    ]);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    logger.error({ error }, 'Transaction failed');
    throw new HttpError('Failed to delete user account', 500);
  } finally {
    session.endSession();
  }

  if (user.avatar?.public_id) {
    try {
      await cloudinaryV2.uploader.destroy(user.avatar.public_id);
    } catch (error) {
      logger.error({ error }, 'Failed to delete avatar from Cloudinary');
    }
  }
};
