export interface UserType {
  id: string;
  name: string;
  globalStreak: number;
  lastActiveDate: Date;
  globalXP: number;
  globalLevel: number;
  hasCreatedFirstTask: boolean;
  email: string;
}

export interface UserLevelUpEvent {
  userId: string;
  previousLevel: number;
  newLevel: number;
  totalXP: number;
}

export interface UserStatsUpdate {
  globalStreak: number;
  globalXP: number;
  globalLevel: number;
  lastActiveDate: Date;
  levelUpEvent?: UserLevelUpEvent;
}
