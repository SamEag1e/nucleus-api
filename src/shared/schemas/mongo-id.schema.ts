import { z } from 'zod';

import { mongoIdRegex } from '@shared/consts/regexes';

export const mongoIdStringSchema = z
  .string()
  .regex(mongoIdRegex, { message: 'Invalid MongoDB ObjectId' });

export type MongoId = z.infer<typeof mongoIdStringSchema>; // Just the string

export const mongoIdParamSchema = z.object({
  id: mongoIdStringSchema.openapi({
    param: {
      name: 'id',
      in: 'path',
      required: true,
      description: 'MongoDB ObjectId (24 lowercase hex characters)',
      example: '60f1b5f2a2b9a8a1d0e0c123',
    },
  }),
});

export type MongoIdParam = z.infer<typeof mongoIdParamSchema>; // { id: string }
