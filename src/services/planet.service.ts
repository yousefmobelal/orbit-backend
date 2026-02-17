import Planet from '@/models/planet.model';
import { CreatePlanetInput, LevelUpEvent, UpdatePlanetInput } from '@/types/planet';
import { HttpError } from '@/utils/http-error';
import { PROGRESSION, calculatePlanetXPForNextLevel } from '@/config/progression';
import { createNarrative } from './narrative.service';

export const createPlanet = async (userId: string, input: CreatePlanetInput) => {
  // Check planet limit
  const planetCount = await Planet.countDocuments({ userId, isArchived: false });
  if (planetCount >= PROGRESSION.MAX_PLANETS_PER_USER) {
    throw new HttpError(`Maximum ${PROGRESSION.MAX_PLANETS_PER_USER} planets allowed`, 400);
  }

  // Check if this is the first planet
  const isFirstPlanet = planetCount === 0;

  // Get next order number
  const maxOrder = await Planet.findOne({ userId }).sort({ order: -1 }).select('order').lean();
  const order = maxOrder ? maxOrder.order + 1 : 0;

  // Create planet
  const planet = await Planet.create({
    userId,
    title: input.title,
    description: input.description,
    theme: input.theme,
    order,
  });

  // Generate narrative for planet creation (synchronous to return with planet)
  const eventType = isFirstPlanet ? 'FIRST_PLANET' : 'NEW_PLANET';
  const narrative = await createNarrative({
    userId,
    eventType,
    metadata: {
      planetTitle: planet.title,
      planetId: planet._id.toString(),
    },
  });

  return { planet: planet.toObject(), narrative };
};

export const getUserPlanets = async (userId: string) => {
  const planets = await Planet.find({ userId, isArchived: false }).sort({ order: 1 }).lean();
  return planets;
};

export const getPlanetById = async (planetId: string, userId: string) => {
  const planet = await Planet.findOne({ _id: planetId, userId }).lean();
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }
  return planet;
};

export const updatePlanet = async (planetId: string, userId: string, input: UpdatePlanetInput) => {
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  if (input.title !== undefined) planet.title = input.title;
  if (input.description !== undefined) planet.description = input.description;
  if (input.theme !== undefined) planet.theme = input.theme;

  await planet.save();
  return planet;
};

export const archivePlanet = async (planetId: string, userId: string) => {
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  planet.isArchived = true;
  await planet.save();
};

export const addXP = async (
  planetId: string,
  userId: string,
  xpAmount: number,
): Promise<{ planet: any; levelUpEvent: LevelUpEvent | null }> => {
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  planet.xp += xpAmount;

  // Check for level up
  let levelUpEvent: LevelUpEvent | null = null;
  const requiredXP = calculatePlanetXPForNextLevel(planet.level);

  if (planet.xp >= requiredXP) {
    const previousLevel = planet.level;
    planet.level += 1;
    planet.xp -= requiredXP; // Carry over remaining XP

    levelUpEvent = {
      planetId: planet._id.toString(),
      previousLevel,
      newLevel: planet.level,
      userId,
      planetTitle: planet.title,
    };
  }

  await planet.save();
  return { planet: planet.toObject(), levelUpEvent };
};
