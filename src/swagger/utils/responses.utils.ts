import { z } from 'zod';

export const successResponse = (description: string, dataSchema: any) => {
  // If it’s already a Zod object, use it; otherwise, wrap as z.object
  const schema =
    dataSchema instanceof z.ZodType ? dataSchema : z.object(dataSchema);

  return {
    description,
    content: {
      'application/json': {
        schema: z.object({
          status: z.literal('success'),
          data: schema,
        }),
      },
    },
  };
};

export const failResponse = (
  description = 'Bad Request (Validation or Business error)'
) => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        status: z.literal('fail'),
        data: z.object(),
      }),
    },
  },
});

export const errorResponse = (description = 'Unexpected server error') => ({
  description,
  content: {
    'application/json': {
      schema: z.object({
        status: z.literal('error'),
        message: z.string(),
        data: z.object().optional(),
      }),
    },
  },
});
