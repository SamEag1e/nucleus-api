import { z } from 'zod';

import { GenderEnum } from '@shared/enums/gender.enum';

export const userUpdateZodSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  gender: z.enum(GenderEnum).optional(),
});

export type UpdateUser = z.infer<typeof userUpdateZodSchema>;
