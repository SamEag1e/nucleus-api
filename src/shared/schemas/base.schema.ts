import { z } from 'zod';
import { Types } from 'mongoose';

export const baseExposeSchema = z.object({
  _id: z.instanceof(Types.ObjectId),

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

  __v: z.number(),
});
