import mongoose from 'mongoose';

import { GenderEnum } from '@shared/enums/gender.enum';

const userMongoSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: Object.values(GenderEnum) },
  },
  {
    timestamps: true,
    strict: true,
    autoCreate: false,
  }
);

export const userModel = mongoose.model('User', userMongoSchema);
