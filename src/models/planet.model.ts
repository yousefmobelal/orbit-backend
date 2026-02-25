import { PlanetResponse } from '@/types/planet';
import mongoose from 'mongoose';

const planetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },
    theme: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theme',
      required: true,
    },

    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    xp: {
      type: Number,
      default: 0,
      min: 0,
    },

    streakCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastCompletedDate: {
      type: Date,
    },
    order: {
      type: Number,
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Planet = mongoose.model('Planet', planetSchema);

export default Planet;
