import User from '@/models/user.model';
import Task from '@/models/task.model';
import Planet from '@/models/planet.model';
import Narrative from '@/models/narrative.model';
import RefreshToken from '@/models/refreshToken.model';
import { UserLevelUpEvent, UserType } from '@/types/user';
import { HttpError } from '@/utils/http-error';
import { calculateUserXPForNextLevel } from '@/config/progression';
import cloudinaryV2 from '@/config/cloudinary';

/**
 * XP Distribution Strategy: DUPLICATE
 * - Task XP is given to BOTH planet and user
 * - Planet progression: Shows focused goal mastery (100 + level × 40)
 * - User progression: Shows overall productivity (200 + level × 80)
 * - Different formulas balance progression rates despite duplicate XP
 */

export const updateUserGlobalStreak = async (
  userId: string,
): Promise<{ user: any; streak: number }> => {
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
  return { user: user.toObject(), streak: user.globalStreak };
};

export const addGlobalXP = async (
  userId: string,
  xpAmount: number,
): Promise<{ user: any; levelUpEvent: UserLevelUpEvent | null }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  user.globalXP += xpAmount;

  // Check for level up
  let levelUpEvent: UserLevelUpEvent | null = null;
  const requiredXP = calculateUserXPForNextLevel(user.globalLevel);

  if (user.globalXP >= requiredXP) {
    const previousLevel = user.globalLevel;
    user.globalLevel += 1;
    user.globalXP -= requiredXP; // Carry over remaining XP

    levelUpEvent = {
      userId: user._id.toString(),
      previousLevel,
      newLevel: user.globalLevel,
      totalXP: user.globalXP,
    };
  }

  await user.save();
  return { user: user.toObject(), levelUpEvent };
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

export const updateProfile = async (
  userId: string,
  input: { name?: string; avatar?: { url: string; public_id: string } },
  oldAvatar?: { public_id: string },
): Promise<UserType> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  if (input.name !== undefined) {
    user.name = input.name;
  }

  if (input.avatar !== undefined) {
    // Delete old avatar from Cloudinary if exists
    if (oldAvatar?.public_id || user.avatar?.public_id) {
      const publicIdToDelete = oldAvatar?.public_id || user.avatar?.public_id;
      if (publicIdToDelete) {
        try {
          await cloudinaryV2.uploader.destroy(publicIdToDelete);
        } catch (error) {
          console.error('Failed to delete old avatar:', error);
          // Continue even if deletion fails
        }
      }
    }

    user.avatar = input.avatar;
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
  // 1. Verify user exists and password is correct
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new HttpError('User not found', 404);
  }

  const isPasswordCorrect = await user.correctPassword(password, user.password);
  if (!isPasswordCorrect) {
    throw new HttpError('Incorrect password', 401);
  }

  // 2. Delete all refresh tokens (invalidate all sessions)
  try {
    await RefreshToken.deleteMany({ userId });
  } catch (error) {
    console.error('Failed to delete refresh tokens:', error);
    throw new HttpError('Failed to delete user sessions', 500);
  }

  // 3. Delete all tasks
  try {
    await Task.deleteMany({ userId });
  } catch (error) {
    console.error('Failed to delete tasks:', error);
    throw new HttpError('Failed to delete user tasks', 500);
  }

  // 4. Delete all planets
  try {
    await Planet.deleteMany({ userId });
  } catch (error) {
    console.error('Failed to delete planets:', error);
    throw new HttpError('Failed to delete user planets', 500);
  }

  // 5. Delete all narratives
  try {
    await Narrative.deleteMany({ userId });
  } catch (error) {
    console.error('Failed to delete narratives:', error);
    throw new HttpError('Failed to delete user narratives', 500);
  }

  // 6. Delete avatar from Cloudinary (non-blocking)
  if (user.avatar?.public_id) {
    try {
      await cloudinaryV2.uploader.destroy(user.avatar.public_id);
    } catch (error) {
      console.error('Failed to delete avatar from Cloudinary:', error);
      // Don't throw - continue with account deletion
    }
  }

  // 7. Delete user document
  try {
    await User.findByIdAndDelete(userId);
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new HttpError('Failed to delete user account', 500);
  }
};
