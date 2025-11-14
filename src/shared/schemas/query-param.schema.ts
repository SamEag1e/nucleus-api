import { z } from 'zod';

export const simpleQuerySchema = z.object({
  q: z
    .string()
    .optional()
    .openapi({
      param: {
        name: 'q',
        in: 'query',
        required: false,
        description: 'Query',
        example: 'test',
      },
    }),
});

export type SimpleQuery = z.infer<typeof simpleQuerySchema>;
