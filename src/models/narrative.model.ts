import mongoose from 'mongoose';

const narrativeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        'LEVEL_UP',
        'STREAK_7',
        'STREAK_14',
        'STREAK_30',
        'FIRST_PLANET',
        'NEW_PLANET',
        'PLANET_LEVEL_UP',
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      level: Number,
      previousLevel: Number,
      streak: Number,
      planetTitle: String,
      planetId: mongoose.Schema.Types.ObjectId,
      globalLevel: Number,
    },
  },
  { timestamps: true },
);

// Index for efficient queries
narrativeSchema.index({ userId: 1, createdAt: -1 });

const Narrative = mongoose.model('Narrative', narrativeSchema);

export default Narrative;
