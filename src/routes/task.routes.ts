import {
  archiveTaskHandler,
  completeTaskHandler,
  createTaskHandler,
  getPlanetTasksHandler,
  getTaskHandler,
  getUserTasksHandler,
  updateTaskHandler,
} from '@/controllers/task.controller';
import { authenticate } from '@/middleware/auth.middleware';
import { validateRequest } from '@/utils/validate-request';
import {
  createTaskSchema,
  planetIdSchema,
  taskIdSchema,
  updateTaskSchema,
} from '@/validation/task.schema';
import { Router } from 'express';

export const taskRouter = Router();

// All task routes require authentication
taskRouter.use(authenticate);

// Create a new task
taskRouter.post('/', validateRequest({ body: createTaskSchema.shape.body }), createTaskHandler);

// Get all user's tasks (with optional planetId query filter)
taskRouter.get('/', getUserTasksHandler);

// Get all tasks for a specific planet
taskRouter.get(
  '/planet/:planetId',
  validateRequest({ params: planetIdSchema.shape.params }),
  getPlanetTasksHandler,
);

// Get a specific task
taskRouter.get('/:id', validateRequest({ params: taskIdSchema.shape.params }), getTaskHandler);

// Update a task
taskRouter.patch(
  '/:id',
  validateRequest({
    params: taskIdSchema.shape.params,
    body: updateTaskSchema.shape.body,
  }),
  updateTaskHandler,
);

// Complete a task (triggers XP and streak updates)
taskRouter.post(
  '/:id/complete',
  validateRequest({ params: taskIdSchema.shape.params }),
  completeTaskHandler,
);

// Archive a task (soft delete)
taskRouter.delete(
  '/:id',
  validateRequest({ params: taskIdSchema.shape.params }),
  archiveTaskHandler,
);
