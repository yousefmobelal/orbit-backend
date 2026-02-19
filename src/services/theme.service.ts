import Theme from '@/models/theme.model';
import Planet from '@/models/planet.model';
import { CreateThemeInput, UpdateThemeInput } from '@/types/theme';
import { HttpError } from '@/utils/http-error';

export const getAllThemes = async () => {
  const themes = await Theme.find();
  return themes;
};

export const getThemeById = async (themeId: string) => {
  const theme = await Theme.findById(themeId).lean();
  if (!theme) {
    throw new HttpError('Theme not found', 404);
  }
  return theme;
};

export const createTheme = async (input: CreateThemeInput) => {
  const theme = await Theme.create(input);
  return theme.toObject();
};

export const updateTheme = async (themeId: string, input: UpdateThemeInput) => {
  const theme = await Theme.findById(themeId);
  if (!theme) {
    throw new HttpError('Theme not found', 404);
  }

  if (input.name !== undefined) theme.name = input.name;
  if (input.fromColor !== undefined) theme.fromColor = input.fromColor;
  if (input.toColor !== undefined) theme.toColor = input.toColor;

  await theme.save();
  return theme.toObject();
};

export const deleteTheme = async (themeId: string) => {
  const theme = await Theme.findById(themeId);
  if (!theme) {
    throw new HttpError('Theme not found', 404);
  }

  // Check if any planets are using this theme
  const planetsUsingTheme = await Planet.countDocuments({ theme: themeId });
  if (planetsUsingTheme > 0) {
    throw new HttpError(
      `Cannot delete theme. ${planetsUsingTheme} planet(s) are currently using this theme`,
      400,
    );
  }

  await theme.deleteOne();
};
