export const NARRATIVE_EVENT_TYPES = [
  'LEVEL_UP',
  'STREAK_7',
  'STREAK_14',
  'STREAK_30',
  'FIRST_PLANET',
  'PLANET_LEVEL_UP',
] as const;

export type NarrativeEventType = (typeof NARRATIVE_EVENT_TYPES)[number];

export interface NarrativeMetadata {
  level?: number;
  previousLevel?: number;
  streak?: number;
  planetTitle?: string;
  planetId?: string;
  globalLevel?: number;
}

export interface CreateNarrativeInput {
  userId: string;
  eventType: NarrativeEventType;
  metadata: NarrativeMetadata;
}

export interface NarrativeResponse {
  _id: string;
  userId: string;
  eventType: NarrativeEventType;
  content: string;
  metadata: NarrativeMetadata;
  createdAt: Date;
  updatedAt: Date;
}
