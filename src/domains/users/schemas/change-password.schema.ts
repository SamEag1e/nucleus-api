import { z } from 'zod';

export const changePasswordZodSchema = z.object({
  oldPassword: z.string().min(8),
  password: z.string().min(8),
});

export type ChangePassword = z.infer<typeof changePasswordZodSchema>;
