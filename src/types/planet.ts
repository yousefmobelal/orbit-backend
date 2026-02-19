// Theme is now a reference to the Theme model (ObjectId)
export type PlanetTheme = string;

export interface CreatePlanetInput {
  title: string;
  description?: string;
  theme: string; // Theme ObjectId
}

export interface UpdatePlanetInput {
  title?: string;
  description?: string;
  theme?: string; // Theme ObjectId
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
