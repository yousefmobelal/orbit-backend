import { LevelUpEvent } from './planet';
import { UserLevelUpEvent } from './user';
import { NarrativeResponse } from './narrative';

export const TASK_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type TaskDifficulty = (typeof TASK_DIFFICULTIES)[number];

export const RECURRING_PATTERNS = ['none', 'daily', 'weekly', 'monthly'] as const;
export type RecurringPattern = (typeof RECURRING_PATTERNS)[number];

export interface TaskResponse {
  _id: string;
  userId: string;
  planetId: string;
  title: string;
  description?: string;
  difficulty: TaskDifficulty;
  isCompleted: boolean;
  completedAt?: Date;
  lastCompletedDate?: Date; // For recurring tasks
  recurring: RecurringPattern;
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCompletionResult {
  task: TaskResponse;
  xpEarned: number;
  // Planet stats
  newPlanetXP: number;
  newPlanetLevel: number;
  planetStreak: number;
  planetLevelUpEvent?: LevelUpEvent;
  // User stats
  userStats: {
    globalStreak: number;
    globalXP: number;
    globalLevel: number;
  };
  userLevelUpEvent?: UserLevelUpEvent;
  // Achievement narratives
  narratives?: NarrativeResponse[];
}

export interface TaskCreationResult {
  task: TaskResponse;
  xpEarned?: {
    planetXP: number;
    userXP: number;
    firstTaskBonus?: number;
  };
  newPlanetXP?: number;
  newPlanetLevel?: number;
  planetLevelUpEvent?: LevelUpEvent;
  userStats?: {
    globalXP: number;
    globalLevel: number;
  };
  userLevelUpEvent?: UserLevelUpEvent;
}

export interface TaskUpdateResult {
  task: TaskResponse;
  xpEarned?: {
    planetXP: number;
    userXP: number;
  };
  newPlanetXP?: number;
  newPlanetLevel?: number;
  planetLevelUpEvent?: LevelUpEvent;
  userStats?: {
    globalXP: number;
    globalLevel: number;
  };
  userLevelUpEvent?: UserLevelUpEvent;
}

export interface TaskArchiveResult {
  task: TaskResponse;
  xpDeducted?: {
    planetXP: number;
    userXP: number;
  };
  newPlanetXP?: number;
  newUserXP?: number;
}

export interface RecurringTaskCooldown {
  canComplete: boolean;
  reason?: string;
  availableAt?: Date;
  hoursRemaining?: number;
}

export interface TaskCompletionStatus {
  isCompletedToday: boolean;
  canComplete: boolean;
  nextAvailableAt?: Date;
}
