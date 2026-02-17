import Planet from '@/models/planet.model';
import Task from '@/models/task.model';
import { CreateTaskInput, TaskCompletionResult, UpdateTaskInput } from '@/types/task';
import { LevelUpEvent } from '@/types/planet';
import { HttpError } from '@/utils/http-error';
import { getTaskXP, calculatePlanetXPForNextLevel } from '@/config/progression';
import { addGlobalXP, updateUserGlobalStreak } from './user.service';

const updatePlanetProgress = async (
  planetId: string,
  userId: string,
  xpAmount: number,
): Promise<{ planet: any; streak: number; levelUpEvent: LevelUpEvent | null }> => {
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  // Update streak
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!planet.lastCompletedDate) {
    planet.streakCount = 1;
    planet.lastCompletedDate = new Date();
  } else {
    const lastCompleted = new Date(planet.lastCompletedDate);
    lastCompleted.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      planet.streakCount += 1;
      planet.lastCompletedDate = new Date();
    } else if (diffDays > 1) {
      planet.streakCount = 1;
      planet.lastCompletedDate = new Date();
    }
  }

  // Add XP
  planet.xp += xpAmount;

  // Check for level up
  let levelUpEvent: LevelUpEvent | null = null;
  const requiredXP = calculatePlanetXPForNextLevel(planet.level);

  if (planet.xp >= requiredXP) {
    const previousLevel = planet.level;
    planet.level += 1;
    planet.xp -= requiredXP;

    levelUpEvent = {
      planetId: planet._id.toString(),
      previousLevel,
      newLevel: planet.level,
      userId,
      planetTitle: planet.title,
    };
  }

  await planet.save();
  return { planet: planet.toObject(), streak: planet.streakCount, levelUpEvent };
};

export const createTask = async (userId: string, input: CreateTaskInput) => {
  // Verify planet exists and belongs to user
  const planet = await Planet.findOne({ _id: input.planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  // Get next order number
  const maxOrder = await Task.findOne({ planetId: input.planetId })
    .sort({ order: -1 })
    .select('order')
    .lean();
  const order = maxOrder ? maxOrder.order + 1 : 0;

  // Create task
  const task = await Task.create({
    userId,
    planetId: input.planetId,
    title: input.title,
    description: input.description,
    difficulty: input.difficulty,
    recurring: input.recurring || 'none',
    order,
  });

  return task;
};

export const getUserTasks = async (userId: string, planetId?: string) => {
  const filter: any = { userId, isArchived: false };
  if (planetId) {
    filter.planetId = planetId;
  }

  const tasks = await Task.find(filter).sort({ order: 1 }).lean();
  return tasks;
};

export const getPlanetTasks = async (planetId: string, userId: string) => {
  // Verify planet belongs to user
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  const tasks = await Task.find({ planetId, isArchived: false }).sort({ order: 1 }).lean();
  return tasks;
};

export const getTaskById = async (taskId: string, userId: string) => {
  const task = await Task.findOne({ _id: taskId, userId }).lean();
  if (!task) {
    throw new HttpError('Task not found', 404);
  }
  return task;
};

export const updateTask = async (taskId: string, userId: string, input: UpdateTaskInput) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new HttpError('Task not found', 404);
  }

  if (input.title !== undefined) task.title = input.title;
  if (input.description !== undefined) task.description = input.description;
  if (input.difficulty !== undefined) task.difficulty = input.difficulty;
  if (input.recurring !== undefined) task.recurring = input.recurring;

  await task.save();
  return task;
};

export const completeTask = async (
  taskId: string,
  userId: string,
): Promise<TaskCompletionResult> => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new HttpError('Task not found', 404);
  }

  if (task.isCompleted) {
    throw new HttpError('Task is already completed', 400);
  }

  // Mark task as completed
  task.isCompleted = true;
  task.completedAt = new Date();
  await task.save();

  // Calculate XP
  const xpEarned = getTaskXP(task.difficulty);

  // Update planet progress (streak + XP + level-up) in ONE DB operation
  const {
    planet,
    streak: planetStreak,
    levelUpEvent: planetLevelUpEvent,
  } = await updatePlanetProgress(task.planetId.toString(), userId, xpEarned);

  // Update user global streak (returns updated user object)
  const { user, streak: globalStreak } = await updateUserGlobalStreak(userId);

  // Add XP to user global stats (handles user level ups)
  const { user: updatedUser, levelUpEvent: userLevelUpEvent } = await addGlobalXP(userId, xpEarned);

  const result: TaskCompletionResult = {
    task: task.toObject() as any,
    xpEarned,
    // Planet stats
    newPlanetXP: planet.xp,
    newPlanetLevel: planet.level,
    planetStreak,
    planetLevelUpEvent: planetLevelUpEvent || undefined,
    // User stats
    userStats: {
      globalStreak: updatedUser.globalStreak,
      globalXP: updatedUser.globalXP,
      globalLevel: updatedUser.globalLevel,
    },
    userLevelUpEvent: userLevelUpEvent || undefined,
  };

  return result;
};

export const archiveTask = async (taskId: string, userId: string) => {
  const task = await Task.findOne({ _id: taskId, userId });
  if (!task) {
    throw new HttpError('Task not found', 404);
  }

  task.isArchived = true;
  await task.save();
};
