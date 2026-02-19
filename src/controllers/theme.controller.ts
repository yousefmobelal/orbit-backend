import {
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
} from '@/services/theme.service';
import { CreateThemeInput, UpdateThemeInput } from '@/types/theme';
import { asyncHandler } from '@/utils/async-handler';

export const getAllThemesHandler = asyncHandler(async (req, res) => {
  const themes = await getAllThemes();
  res.status(200).json(themes);
});

export const getThemeByIdHandler = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const theme = await getThemeById(id);
  res.status(200).json(theme);
});

export const createThemeHandler = asyncHandler(async (req, res) => {
  const payload = req.body as CreateThemeInput;
  const theme = await createTheme(payload);
  res.status(201).json(theme);
});

export const updateThemeHandler = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const payload = req.body as UpdateThemeInput;
  const theme = await updateTheme(id, payload);
  res.status(200).json(theme);
});

export const deleteThemeHandler = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  await deleteTheme(id);
  res.status(204).send();
});
