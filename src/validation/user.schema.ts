import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .max(40, 'Name must be less than 40 characters long')
      .optional(),
  }),
});
