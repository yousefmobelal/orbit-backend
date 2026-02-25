import { NarrativeResponse } from './narrative';

export type PlanetTheme = string;

export interface CreatePlanetInput {
  title: string;
  description?: string;
  theme: string;
}

export interface UpdatePlanetInput {
  title?: string;
  description?: string;
  theme?: string;
}

export interface PlanetResponse {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  theme: string;
  level: number;
  xp: number;
  requiredXPForNextLevel: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
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

export interface PlanetCreationResult {
  planet: PlanetResponse;
  narrative: NarrativeResponse;
}
