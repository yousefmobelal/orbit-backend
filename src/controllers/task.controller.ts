import {
  archiveTask,
  completeTask,
  createTask,
  getPlanetTasks,
  getTaskById,
  getUserTasks,
  updateTask,
} from '@/services/task.service';
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskCreationResult,
  TaskUpdateResult,
  TaskArchiveResult,
  TaskCompletionResult,
  TaskResponse,
} from '@/types/task';
import { asyncHandler } from '@/utils/async-handler';
import { HttpError } from '@/utils/http-error';
import { ResponseStatus } from '@/types/response';

export const createTaskHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const payload = req.body as CreateTaskInput;
  const result: TaskCreationResult = await createTask(req.user._id.toString(), payload);

  res.status(201).json({
    status: ResponseStatus.SUCCESS,
    data: result,
  });
});

export const getUserTasksHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const planetId = req.query.planetId as string | undefined;
  const tasks = await getUserTasks(req.user._id.toString(), planetId);
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: tasks,
  });
});

export const getPlanetTasksHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const planetId = req.params.planetId as string;
  const tasks = await getPlanetTasks(planetId, req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: tasks,
  });
});

export const getTaskHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const task = await getTaskById(id, req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: task,
  });
});

export const updateTaskHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const payload = req.body as UpdateTaskInput;
  const result: TaskUpdateResult = await updateTask(id, req.user._id.toString(), payload);
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: result,
  });
});

export const completeTaskHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const result: TaskCompletionResult = await completeTask(id, req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: result,
  });
});

export const archiveTaskHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new HttpError('Authentication required', 401);
  }

  const id = req.params.id as string;
  const result: TaskArchiveResult = await archiveTask(id, req.user._id.toString());
  res.status(200).json({
    status: ResponseStatus.SUCCESS,
    data: result,
  });
});
