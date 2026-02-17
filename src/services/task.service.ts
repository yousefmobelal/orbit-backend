import Planet from '@/models/planet.model';
import Task from '@/models/task.model';
import {
  CreateTaskInput,
  RecurringPattern,
  RecurringTaskCooldown,
  TaskCompletionResult,
  TaskCompletionStatus,
  UpdateTaskInput,
} from '@/types/task';
import { LevelUpEvent } from '@/types/planet';
import { HttpError } from '@/utils/http-error';
import { getTaskXP, calculatePlanetXPForNextLevel } from '@/config/progression';
import { addGlobalXP, updateUserGlobalStreak } from './user.service';
import { createNarrative } from './narrative.service';

const canCompleteRecurringTask = (
  recurring: RecurringPattern,
  lastCompletedDate?: Date,
): RecurringTaskCooldown => {
  // Non-recurring tasks always completable (checked elsewhere)
  if (recurring === 'none') {
    return { canComplete: true };
  }

  // If never completed, can complete now
  if (!lastCompletedDate) {
    return { canComplete: true };
  }

  const now = new Date();
  const lastCompleted = new Date(lastCompletedDate);

  switch (recurring) {
    case 'daily': {
      // Check if 24 hours have passed
      const hoursSinceCompletion = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCompletion >= 24) {
        return { canComplete: true };
      }

      const hoursRemaining = Math.ceil(24 - hoursSinceCompletion);
      const availableAt = new Date(lastCompleted.getTime() + 24 * 60 * 60 * 1000);

      return {
        canComplete: false,
        reason: `Task can be completed again in ${hoursRemaining} hour(s)`,
        availableAt,
        hoursRemaining,
      };
    }

    case 'weekly': {
      // Check if 7 days have passed
      const daysSinceCompletion = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCompletion >= 7) {
        return { canComplete: true };
      }

      const daysRemaining = Math.ceil(7 - daysSinceCompletion);
      const availableAt = new Date(lastCompleted.getTime() + 7 * 24 * 60 * 60 * 1000);

      return {
        canComplete: false,
        reason: `Task can be completed again in ${daysRemaining} day(s)`,
        availableAt,
        hoursRemaining: daysRemaining * 24,
      };
    }

    case 'monthly': {
      // Check if 30 days have passed (simplified monthly calculation)
      const daysSinceCompletion = (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCompletion >= 30) {
        return { canComplete: true };
      }

      const daysRemaining = Math.ceil(30 - daysSinceCompletion);
      const availableAt = new Date(lastCompleted.getTime() + 30 * 24 * 60 * 60 * 1000);

      return {
        canComplete: false,
        reason: `Task can be completed again in ${daysRemaining} day(s)`,
        availableAt,
        hoursRemaining: daysRemaining * 24,
      };
    }

    default:
      return { canComplete: true };
  }
};

export const getTaskCompletionStatus = (task: any): TaskCompletionStatus => {
  // Non-recurring tasks: check isCompleted flag
  if (task.recurring === 'none') {
    return {
      isCompletedToday: task.isCompleted,
      canComplete: !task.isCompleted,
    };
  }

  // Recurring tasks: check cooldown
  const cooldown = canCompleteRecurringTask(task.recurring, task.lastCompletedDate);

  return {
    isCompletedToday: !cooldown.canComplete,
    canComplete: cooldown.canComplete,
    nextAvailableAt: cooldown.availableAt,
  };
};

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

  // For non-recurring tasks, check isCompleted flag
  if (task.recurring === 'none' && task.isCompleted) {
    throw new HttpError('Task is already completed', 400);
  }

  // For recurring tasks, validate cooldown
  if (task.recurring !== 'none') {
    const cooldown = canCompleteRecurringTask(task.recurring, task.lastCompletedDate || undefined);
    if (!cooldown.canComplete) {
      throw new HttpError(cooldown.reason || 'Task cannot be completed yet', 400);
    }
  }

  // Mark task completion based on type
  if (task.recurring === 'none') {
    // Non-recurring: permanently complete
    task.isCompleted = true;
    task.completedAt = new Date();
  } else {
    // Recurring: update lastCompletedDate for cooldown tracking
    task.lastCompletedDate = new Date();
    // Keep isCompleted = false so task remains active
  }
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

  // Generate narratives for significant events (async, non-blocking)
  const narrativePromises = [];

  // Planet level-up narrative
  if (planetLevelUpEvent) {
    narrativePromises.push(
      createNarrative({
        userId,
        eventType: 'PLANET_LEVEL_UP',
        metadata: {
          level: planetLevelUpEvent.newLevel,
          previousLevel: planetLevelUpEvent.previousLevel,
          planetTitle: planetLevelUpEvent.planetTitle,
          planetId: planetLevelUpEvent.planetId,
        },
      }),
    );
  }

  // User level-up narrative
  if (userLevelUpEvent) {
    narrativePromises.push(
      createNarrative({
        userId,
        eventType: 'LEVEL_UP',
        metadata: {
          globalLevel: userLevelUpEvent.newLevel,
          previousLevel: userLevelUpEvent.previousLevel,
        },
      }),
    );
  }

  // Streak milestone narratives
  if (planetStreak === 7) {
    narrativePromises.push(
      createNarrative({
        userId,
        eventType: 'STREAK_7',
        metadata: {
          streak: 7,
          planetTitle: planet.title,
          planetId: planet._id,
        },
      }),
    );
  } else if (planetStreak === 14) {
    narrativePromises.push(
      createNarrative({
        userId,
        eventType: 'STREAK_14',
        metadata: {
          streak: 14,
          planetTitle: planet.title,
          planetId: planet._id,
        },
      }),
    );
  } else if (planetStreak === 30) {
    narrativePromises.push(
      createNarrative({
        userId,
        eventType: 'STREAK_30',
        metadata: {
          streak: 30,
          planetTitle: planet.title,
          planetId: planet._id,
        },
      }),
    );
  }

  // Generate narratives synchronously for immediate feedback
  let narratives: any[] = [];
  if (narrativePromises.length > 0) {
    try {
      narratives = await Promise.all(narrativePromises);
    } catch (error) {
      console.error('Failed to generate narratives:', error);
      // Continue without narratives rather than failing the task completion
    }
  }

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
    // Achievement narratives
    narratives: narratives.length > 0 ? narratives : undefined,
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
