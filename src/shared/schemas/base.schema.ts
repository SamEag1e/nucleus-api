import { z } from 'zod';

import { mongoIdStringSchema } from './mongo-id.schema';

export const baseExposeSchema = z.object({
  id: mongoIdStringSchema,
  createdAt: z.date().openapi({
    title: 'Created At',
    description: 'Creation timestamp',
    example: '2025-07-22T08:22:53.590Z',
  }),
  updatedAt: z.date().openapi({
    title: 'Updated At',
    description: 'Last updated timestamp',
    example: '2025-07-22T08:22:53.590Z',
  }),
});
