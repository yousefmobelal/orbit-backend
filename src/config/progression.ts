export const PROGRESSION = {
  PLANET_XP_BASE: 100,
  PLANET_XP_MULTIPLIER: 40,
  USER_XP_BASE: 200,
  USER_XP_MULTIPLIER: 80,
  TASK_XP: {
    EASY: 15,
    MEDIUM: 30,
    HARD: 60,
  },
  USER_TASK_XP: {
    EASY: 5,
    MEDIUM: 10,
    HARD: 20,
  },
  FIRST_TASK_BONUS: 15,
  MAX_PLANETS_PER_USER: 6,
} as const;

export const calculatePlanetXPForNextLevel = (level: number): number => {
  return PROGRESSION.PLANET_XP_BASE + level * PROGRESSION.PLANET_XP_MULTIPLIER;
};

export const calculateUserXPForNextLevel = (level: number): number => {
  return PROGRESSION.USER_XP_BASE + level * PROGRESSION.USER_XP_MULTIPLIER;
};

export const getTaskXP = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const xpMap = {
    easy: PROGRESSION.TASK_XP.EASY,
    medium: PROGRESSION.TASK_XP.MEDIUM,
    hard: PROGRESSION.TASK_XP.HARD,
  };
  return xpMap[difficulty];
};

export const getUserTaskXP = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const xpMap = {
    easy: PROGRESSION.USER_TASK_XP.EASY,
    medium: PROGRESSION.USER_TASK_XP.MEDIUM,
    hard: PROGRESSION.USER_TASK_XP.HARD,
  };
  return xpMap[difficulty];
};
