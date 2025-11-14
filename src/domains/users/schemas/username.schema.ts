import { z } from 'zod';

export const usernameParamZodSchema = z.object({
  username: z.string().min(4),
});

export type UsernameParam = z.infer<typeof usernameParamZodSchema>;
