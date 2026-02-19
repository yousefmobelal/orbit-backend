import { z } from 'zod';

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const createThemeSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Theme name must be at least 3 characters long')
      .max(50, 'Theme name must be less than 50 characters long')
      .trim(),
    fromColor: z
      .string()
      .regex(hexColorRegex, 'From color must be a valid hex color (e.g., #FFFFFF)'),
    toColor: z.string().regex(hexColorRegex, 'To color must be a valid hex color (e.g., #FFFFFF)'),
  }),
});

export const updateThemeSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
      message: 'Invalid theme ID format',
    }),
  }),
  body: z.object({
    name: z
      .string()
      .min(3, 'Theme name must be at least 3 characters long')
      .max(50, 'Theme name must be less than 50 characters long')
      .trim()
      .optional(),
    fromColor: z
      .string()
      .regex(hexColorRegex, 'From color must be a valid hex color (e.g., #FFFFFF)')
      .optional(),
    toColor: z
      .string()
      .regex(hexColorRegex, 'To color must be a valid hex color (e.g., #FFFFFF)')
      .optional(),
  }),
});

export const themeIdParamSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
      message: 'Invalid theme ID format',
    }),
  }),
});
