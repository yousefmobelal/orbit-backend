import mongoose from 'mongoose';

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theme name is required'],
      trim: true,
      minlength: [3, 'Theme name must be at least 3 characters long'],
      maxlength: [50, 'Theme name must be less than 50 characters long'],
    },
    fromColor: {
      type: String,
      required: [true, 'From color is required'],
      match: [/^#[0-9A-Fa-f]{6}$/, 'From color must be a valid hex color (e.g., #FFFFFF)'],
    },
    toColor: {
      type: String,
      required: [true, 'To color is required'],
      match: [/^#[0-9A-Fa-f]{6}$/, 'To color must be a valid hex color (e.g., #FFFFFF)'],
    },
  },
  { timestamps: true },
);

const Theme = mongoose.model('Theme', themeSchema);

export default Theme;
