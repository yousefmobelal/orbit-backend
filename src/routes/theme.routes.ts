import {
  getAllThemesHandler,
  getThemeByIdHandler,
  createThemeHandler,
  updateThemeHandler,
  deleteThemeHandler,
} from '@/controllers/theme.controller';
import { validateRequest } from '@/utils/validate-request';
import {
  createThemeSchema,
  updateThemeSchema,
  themeIdParamSchema,
} from '@/validation/theme.schema';
import { Router } from 'express';

export const themeRouter = Router();

themeRouter.get('/', getAllThemesHandler);

themeRouter.get(
  '/:id',
  validateRequest({ params: themeIdParamSchema.shape.params }),
  getThemeByIdHandler,
);

themeRouter.post('/', validateRequest({ body: createThemeSchema.shape.body }), createThemeHandler);

themeRouter.patch(
  '/:id',
  validateRequest({ params: updateThemeSchema.shape.params, body: updateThemeSchema.shape.body }),
  updateThemeHandler,
);

themeRouter.delete(
  '/:id',
  validateRequest({ params: themeIdParamSchema.shape.params }),
  deleteThemeHandler,
);
