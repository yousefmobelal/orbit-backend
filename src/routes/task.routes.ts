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

taskRouter.use(authenticate);

taskRouter.post('/', validateRequest({ body: createTaskSchema }), createTaskHandler);

taskRouter.get('/', getUserTasksHandler);

taskRouter.get(
  '/planet/:planetId',
  validateRequest({ params: planetIdSchema }),
  getPlanetTasksHandler,
);

taskRouter.get('/:id', validateRequest({ params: taskIdSchema }), getTaskHandler);

taskRouter.patch(
  '/:id',
  validateRequest({
    params: taskIdSchema,
    body: updateTaskSchema,
  }),
  updateTaskHandler,
);

taskRouter.post('/:id/complete', validateRequest({ params: taskIdSchema }), completeTaskHandler);

taskRouter.delete('/:id', validateRequest({ params: taskIdSchema }), archiveTaskHandler);
