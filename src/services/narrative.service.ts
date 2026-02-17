import Narrative from '@/models/narrative.model';
import { CreateNarrativeInput, NarrativeEventType, NarrativeMetadata } from '@/types/narrative';
import { env } from '@/config/env';
import { HttpError } from '@/utils/http-error';

/**
 * Generate narrative content using AI or fallback templates
 */
const generateNarrativeContent = async (
  eventType: NarrativeEventType,
  metadata: NarrativeMetadata,
): Promise<string> => {
  // If OpenAI key is available, use AI generation
  if (env.OPENAI_API_KEY) {
    try {
      return await generateWithAI(eventType, metadata);
    } catch (error) {
      console.error('AI generation failed, falling back to templates:', error);
      return generateWithTemplate(eventType, metadata);
    }
  }

  // Fallback to structured templates
  return generateWithTemplate(eventType, metadata);
};

/**
 * Generate narrative using OpenAI API
 */
const generateWithAI = async (
  eventType: NarrativeEventType,
  metadata: NarrativeMetadata,
): Promise<string> => {
  const prompt = buildPrompt(eventType, metadata);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a motivational narrator for a space-themed productivity app called Orbit. Generate short, elegant, inspirational narratives (1-2 sentences max) in a minimal, Apple-like tone. Avoid emoji and excessive exclamation marks.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || generateWithTemplate(eventType, metadata);
};

/**
 * Build structured prompt for AI
 */
const buildPrompt = (eventType: NarrativeEventType, metadata: NarrativeMetadata): string => {
  switch (eventType) {
    case 'PLANET_LEVEL_UP':
      return `Planet "${metadata.planetTitle}" leveled up from ${metadata.previousLevel} to ${metadata.level}. Generate a celebratory narrative.`;

    case 'LEVEL_UP':
      return `User reached global level ${metadata.globalLevel}. Generate an achievement narrative.`;

    case 'STREAK_7':
      return `User achieved a 7-day streak on planet "${metadata.planetTitle}". Generate an encouraging narrative.`;

    case 'STREAK_14':
      return `User achieved a 14-day streak. Generate a powerful momentum narrative.`;

    case 'STREAK_30':
      return `User achieved a 30-day streak. Generate an epic milestone narrative.`;

    case 'FIRST_PLANET':
      return `User created their first planet "${metadata.planetTitle}". Generate a welcoming narrative about beginning their journey.`;

    default:
      return 'Generate a motivational space-themed message about productivity.';
  }
};

/**
 * Generate narrative using fallback templates
 */
const generateWithTemplate = (
  eventType: NarrativeEventType,
  metadata: NarrativeMetadata,
): string => {
  const templates: Record<NarrativeEventType, (meta: NarrativeMetadata) => string> = {
    PLANET_LEVEL_UP: (meta) =>
      `The planet "${meta.planetTitle}" has reached Level ${meta.level}. Your consistent effort has strengthened its orbit.`,

    LEVEL_UP: (meta) =>
      `You've reached Level ${meta.globalLevel}. Your galaxy expands with each achievement.`,

    STREAK_7: (meta) =>
      `Seven days of consistency on "${meta.planetTitle}". Momentum is building in your orbit.`,

    STREAK_14: (meta) => `Fourteen days strong. Your dedication is reshaping the system.`,

    STREAK_30: (meta) =>
      `Thirty days of unwavering focus. You've entered a new gravitational field of discipline.`,

    FIRST_PLANET: (meta) =>
      `"${meta.planetTitle}" now orbits in your galaxy. Every great system begins with a single intention.`,
  };

  const generator = templates[eventType];
  return generator ? generator(metadata) : 'Your journey through the cosmos continues.';
};

/**
 * Create and store a narrative
 */
export const createNarrative = async (input: CreateNarrativeInput): Promise<any> => {
  const content = await generateNarrativeContent(input.eventType, input.metadata);

  const narrative = await Narrative.create({
    userId: input.userId,
    eventType: input.eventType,
    content,
    metadata: input.metadata,
  });

  return narrative.toObject();
};

/**
 * Get narratives for a user (Cosmic Log)
 */
export const getUserNarratives = async (userId: string, limit: number = 20): Promise<any[]> => {
  const narratives = await Narrative.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();

  return narratives;
};

/**
 * Get latest narrative for a user
 */
export const getLatestNarrative = async (userId: string): Promise<any | null> => {
  const narrative = await Narrative.findOne({ userId }).sort({ createdAt: -1 }).lean();

  return narrative;
};
