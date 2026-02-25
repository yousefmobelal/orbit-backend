import {
  archivePlanetHandler,
  createPlanetHandler,
  getPlanetHandler,
  getUserPlanetsHandler,
  updatePlanetHandler,
} from '@/controllers/planet.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRequest } from '@/utils/validate-request';
import { createPlanetSchema, planetIdSchema, updatePlanetSchema } from '@/validation/planet.schema';
import { Router } from 'express';

export const planetRouter = Router();

planetRouter.use(authenticate);

planetRouter.post(
  '/',
  validateRequest({ body: createPlanetSchema.shape.body }),
  createPlanetHandler,
);

planetRouter.get('/', getUserPlanetsHandler);

planetRouter.get(
  '/:id',
  validateRequest({ params: planetIdSchema.shape.params }),
  getPlanetHandler,
);

planetRouter.patch(
  '/:id',
  validateRequest({
    params: planetIdSchema.shape.params,
    body: updatePlanetSchema.shape.body,
  }),
  updatePlanetHandler,
);

planetRouter.delete(
  '/:id',
  validateRequest({ params: planetIdSchema.shape.params }),
  archivePlanetHandler,
);
