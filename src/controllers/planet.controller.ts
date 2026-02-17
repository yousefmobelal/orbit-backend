import {
  archivePlanet,
  createPlanet,
  getPlanetById,
  getUserPlanets,
  updatePlanet,
} from '@/services/planet.service';
import { CreatePlanetInput, UpdatePlanetInput } from '@/types/planet';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { PLANET_THEMES } from '@/types/planet';
import { THEME_COLORS } from '@/config/theme-colors';

export const createPlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const payload = req.body as CreatePlanetInput;
  const { planet, narrative } = await createPlanet(req.user._id.toString(), payload);
  res.status(201).json({ planet, narrative });
});

export const getUserPlanetsHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const planets = await getUserPlanets(req.user._id.toString());
  res.status(200).json(planets);
});

export const getPlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const planet = await getPlanetById(id, req.user._id.toString());
  res.status(200).json(planet);
});

export const updatePlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const payload = req.body as UpdatePlanetInput;
  const planet = await updatePlanet(id, req.user._id.toString(), payload);
  res.status(200).json(planet);
});

export const archivePlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  await archivePlanet(id, req.user._id.toString());
  res.status(204).send();
});

/**
 * Get all available planet themes with their color palettes
 * @route GET /api/planet/themes
 * @access Public (metadata for planet creation UI)
 */
export const getThemesHandler = asyncHandler(async (req, res) => {
  const themes = PLANET_THEMES.map((themeName) => ({
    name: themeName,
    colors: THEME_COLORS[themeName],
  }));

  res.status(200).json({
    status: 'success',
    data: { themes },
  });
});
