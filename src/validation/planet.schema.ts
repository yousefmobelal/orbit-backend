import { z } from 'zod';

export const createPlanetSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Planet title must be at least 3 characters long')
      .max(40, 'Planet title must be less than 40 characters long')
      .trim(),
    description: z.string().trim().optional(),
    theme: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
      message: 'Invalid theme ID format',
    }),
  }),
});

export const updatePlanetSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(3, 'Planet title must be at least 3 characters long')
      .max(40, 'Planet title must be less than 40 characters long')
      .trim()
      .optional(),
    description: z.string().trim().optional(),
    theme: z
      .string()
      .refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
        message: 'Invalid theme ID format',
      })
      .optional(),
  }),
});

export const planetIdSchema = z.object({
  params: z.object({
    id: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
      message: 'Invalid planet ID format',
    }),
  }),
});
