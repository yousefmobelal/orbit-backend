import { z } from 'zod';
import { RECURRING_PATTERNS, TASK_DIFFICULTIES } from '@/types/task';

export const createTaskSchema = z.object({
  planetId: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
    message: 'Invalid planet ID format',
  }),
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters long')
    .max(100, 'Task title must be less than 100 characters long')
    .trim(),
  description: z.string().trim().optional(),
  difficulty: z.enum(TASK_DIFFICULTIES),
  recurring: z.enum(RECURRING_PATTERNS).optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(3, 'Task title must be at least 3 characters long')
    .max(100, 'Task title must be less than 100 characters long')
    .trim()
    .optional(),
  description: z.string().trim().optional(),
  difficulty: z.enum(TASK_DIFFICULTIES).optional(),
  recurring: z.enum(RECURRING_PATTERNS).optional(),
  isCompleted: z
    .boolean()
    .optional()
    .refine((value) => {
      if (value === undefined) {
        return true;
      }
      throw new Error('Use completeTask endpoint instead of updating isCompleted field');
    }),
});

export const taskIdSchema = z.object({
  id: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
    message: 'Invalid task ID format',
  }),
});

export const planetIdSchema = z.object({
  planetId: z.string().refine((value) => /^[0-9a-fA-F]{24}$/.test(value), {
    message: 'Invalid planet ID format',
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
