import User from '@/models/user.model';
import { UserType } from '@/types/user';
import { HttpError } from '@/utils/http-error';

export const getMe = async (userId: string): Promise<UserType> => {
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new HttpError('User not found', 404);
    }
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      globalStreak: user.globalStreak,
      lastActiveDate: user.lastActiveDate,
      globalXP: user.globalXP,
      globalLevel: user.globalLevel,
    };
  } catch (error) {
    throw error;
  }
};
