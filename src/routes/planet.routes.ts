import {
  archivePlanetHandler,
  createPlanetHandler,
  getPlanetHandler,
  getThemesHandler,
  getUserPlanetsHandler,
  updatePlanetHandler,
} from '@/controllers/planet.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRequest } from '@/utils/validate-request';
import { createPlanetSchema, planetIdSchema, updatePlanetSchema } from '@/validation/planet.schema';
import { Router } from 'express';

export const planetRouter = Router();

// Public route - Get available planet themes with color palettes
planetRouter.get('/themes', getThemesHandler);

// All other planet routes require authentication
planetRouter.use(authenticate);

// Create a new planet
planetRouter.post(
  '/',
  validateRequest({ body: createPlanetSchema.shape.body }),
  createPlanetHandler,
);

// Get all user's planets
planetRouter.get('/', getUserPlanetsHandler);

// Get a specific planet
planetRouter.get(
  '/:id',
  validateRequest({ params: planetIdSchema.shape.params }),
  getPlanetHandler,
);

// Update a planet
planetRouter.patch(
  '/:id',
  validateRequest({
    params: planetIdSchema.shape.params,
    body: updatePlanetSchema.shape.body,
  }),
  updatePlanetHandler,
);

// Archive a planet (soft delete)
planetRouter.delete(
  '/:id',
  validateRequest({ params: planetIdSchema.shape.params }),
  archivePlanetHandler,
);
