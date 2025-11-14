import { z } from 'zod';

import { GenderEnum } from '@shared/enums/gender.enum';
import { baseExposeSchema } from '@shared/schemas/base.schema';

export const userZodSchema = baseExposeSchema.extend({
  firstName: z.string().min(1).max(50).nullable().optional(),
  lastName: z.string().min(1).max(50).nullable().optional(),
  gender: z.enum(GenderEnum).nullable().optional(),
  username: z.string().min(4),
});

export type ExposeUser = z.infer<typeof userZodSchema>;
