import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters long')
      .max(40, 'Name must be less than 40 characters long'),
    email: z.email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.email('Please provide a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

export const logoutSchema = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});
