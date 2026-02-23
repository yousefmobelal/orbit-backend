import Theme from '@/models/theme.model';
import * as factory from '@/utils/handlerFactory';

export const getAllThemesHandler = factory.getAll(Theme);
export const getThemeByIdHandler = factory.getOne(Theme);
export const createThemeHandler = factory.createOne(Theme);
export const updateThemeHandler = factory.updateOne(Theme);
export const deleteThemeHandler = factory.deleteOne(Theme);
