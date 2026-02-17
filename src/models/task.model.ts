import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Planet',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters long'],
      maxlength: [100, 'Task title must be less than 100 characters long'],
    },
    description: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    lastCompletedDate: {
      type: Date,
      // For recurring tasks - tracks when last completed for cooldown validation
    },
    recurring: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none',
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

// Compound index for efficient queries
taskSchema.index({ userId: 1, planetId: 1 });
taskSchema.index({ planetId: 1, isCompleted: 1 });

const Task = mongoose.model('Task', taskSchema);

export default Task;
