import {
  archivePlanet,
  createPlanet,
  getPlanetById,
  getUserPlanets,
  updatePlanet,
} from '@/services/planet.service';
import { CreatePlanetInput, UpdatePlanetInput, PlanetCreationResult } from '@/types/planet';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { ResponseStatus } from '@/types/response';

export const createPlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const payload = req.body as CreatePlanetInput;
  const result: PlanetCreationResult = await createPlanet(req.user._id.toString(), payload);
  res.status(201).json({
    status: ResponseStatus.SUCCESS,
    data: result,
  });
});

export const getUserPlanetsHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const planets = await getUserPlanets(req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: planets,
  });
});

export const getPlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const planet = await getPlanetById(id, req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: planet,
  });
});

export const updatePlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const payload = req.body as UpdatePlanetInput;
  const planet = await updatePlanet(id, req.user._id.toString(), payload);
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: planet,
  });
});

export const archivePlanetHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  await archivePlanet(id, req.user._id.toString());
  res.status(204).send();
});
