import { z } from 'zod';

export const userCreateZodSchema = z.object({
  username: z.string(),
  password: z.string().min(8), // plain password
});

export type CreateUser = z.infer<typeof userCreateZodSchema>;
