import { z } from 'zod';
import { Types } from 'mongoose';

export const baseExposeSchema = z.object({
  _id: z.instanceof(Types.ObjectId).openapi({
    type: 'string',
    example: '60f1b5f2a2b9a8a1d0e0c123',
  }),

  createdAt: z.date().openapi({
    example: '2025-07-22T08:22:53.590Z',
  }),

  updatedAt: z.date().openapi({
    example: '2025-07-22T08:22:53.590Z',
  }),

  __v: z.number().openapi({
    example: 0,
  }),
});
