export const PLANET_THEMES = [
  'aurora-blue',
  'solar-gold',
  'crimson-nova',
  'emerald-pulse',
  'violet-drift',
  'silver-orbit',
] as const;

export type PlanetTheme = (typeof PLANET_THEMES)[number];

export interface CreatePlanetInput {
  title: string;
  description?: string;
  theme: PlanetTheme;
}

export interface UpdatePlanetInput {
  title?: string;
  description?: string;
  theme?: PlanetTheme;
}

export interface PlanetResponse {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  theme: string;
  level: number;
  xp: number;
  streakCount: number;
  lastCompletedDate?: Date;
  order: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LevelUpEvent {
  planetId: string;
  previousLevel: number;
  newLevel: number;
  userId: string;
  planetTitle: string;
}
