import mongoose, { type Document, type Model } from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
      trim: true,
      maxlength: [40, 'Name must have less or equal than 40 characters'],
      minlength: [3, 'Name must have more or equal than 3 characters'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
  },
  { timestamps: true },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre('deleteOne', { document: true, query: false }, async function () {
  const RefreshToken = (await import('./refreshToken.model')).default;
  await RefreshToken.deleteMany({ userId: this._id });
});

userSchema.pre('findOneAndDelete', async function () {
  const RefreshToken = (await import('./refreshToken.model')).default;
  const user = await this.model.findOne(this.getFilter());
  if (user) {
    await RefreshToken.deleteMany({ userId: user._id });
  }
});

userSchema.methods.correctPassword = async function (
  candidatePassword: string,
  userPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
