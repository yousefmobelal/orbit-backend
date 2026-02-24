import mongoose from 'mongoose';
import Planet from '@/models/planet.model';
import { CreatePlanetInput, LevelUpEvent, PlanetResponse, UpdatePlanetInput } from '@/types/planet';
import { HttpError } from '@/utils/http-error';
import { PROGRESSION, calculatePlanetXPForNextLevel } from '@/config/progression';
import { createNarrative } from './narrative.service';

const mapPlanetToResponse = (planet: any): PlanetResponse => {
  const doc = planet.toObject ? planet.toObject() : planet;
  const requiredXPForNextLevel = calculatePlanetXPForNextLevel(doc.level);
  const xpToNextLevel = Math.max(0, requiredXPForNextLevel - doc.xp);
  const xpProgressPercent = requiredXPForNextLevel > 0 ? doc.xp / requiredXPForNextLevel : 0;

  return {
    _id: doc._id.toString(),
    userId: doc.userId.toString(),
    title: doc.title,
    description: doc.description,
    theme: doc.theme,
    level: doc.level,
    xp: doc.xp,
    requiredXPForNextLevel,
    xpToNextLevel,
    xpProgressPercent,
    streakCount: doc.streakCount,
    lastCompletedDate: doc.lastCompletedDate,
    order: doc.order,
    isArchived: doc.isArchived,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
};

export const createPlanet = async (userId: string, input: CreatePlanetInput) => {
  const planetCount = await Planet.countDocuments({ userId, isArchived: false });
  if (planetCount >= PROGRESSION.MAX_PLANETS_PER_USER) {
    throw new HttpError(`Maximum ${PROGRESSION.MAX_PLANETS_PER_USER} planets allowed`, 400);
  }

  const isFirstPlanet = planetCount === 0;

  const maxOrder = await Planet.findOne({ userId }).sort({ order: -1 }).select('order').lean();
  const order = maxOrder ? maxOrder.order + 1 : 0;

  const planet = await Planet.create({
    userId,
    title: input.title,
    description: input.description,
    theme: input.theme,
    order,
  });

  const eventType = isFirstPlanet ? 'FIRST_PLANET' : 'NEW_PLANET';
  const narrative = await createNarrative({
    userId,
    eventType,
    metadata: {
      planetTitle: planet.title,
      planetId: planet._id.toString(),
    },
  });

  await planet.populate('theme');

  return { planet: mapPlanetToResponse(planet), narrative };
};

export const getUserPlanets = async (userId: string): Promise<PlanetResponse[]> => {
  const planets = await Planet.find({ userId, isArchived: false })
    .sort({ order: 1 })
    .populate('theme')
    .lean();

  return planets.map((planet) => mapPlanetToResponse(planet));
};

export const getPlanetById = async (planetId: string, userId: string): Promise<PlanetResponse> => {
  const planet = await Planet.findOne({ _id: planetId, userId }).populate('theme').lean();
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  return mapPlanetToResponse(planet);
};

export const updatePlanet = async (
  planetId: string,
  userId: string,
  input: UpdatePlanetInput,
): Promise<PlanetResponse> => {
  const planet = await Planet.findOne({ _id: planetId, userId });
  if (!planet) {
    throw new HttpError('Planet not found', 404);
  }

  if (input.title !== undefined) planet.title = input.title;
  if (input.description !== undefined) planet.description = input.description;
  if (input.theme !== undefined) planet.theme = new mongoose.Types.ObjectId(input.theme);

  await planet.save();
  await planet.populate('theme');

  return mapPlanetToResponse(planet);
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
  return { planet: planet.toObject(), levelUpEvent };
};
