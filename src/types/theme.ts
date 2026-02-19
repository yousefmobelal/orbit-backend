export interface CreateThemeInput {
  name: string;
  fromColor: string;
  toColor: string;
}

export interface UpdateThemeInput {
  name?: string;
  fromColor?: string;
  toColor?: string;
}

export interface ThemeResponse {
  _id: string;
  name: string;
  fromColor: string;
  toColor: string;
  createdAt: Date;
  updatedAt: Date;
}
