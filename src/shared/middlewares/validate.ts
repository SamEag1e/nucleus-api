import { RequestHandler } from 'express';
import { z } from 'zod';

import { formatZodError } from '@shared/utils/error-formatter';

export const validate = (
  schema: z.ZodType,
  location: 'body' | 'params' | 'query'
): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req[location]);
    if (!result.success) {
      res.status(400).json({
        status: 'fail',
        data: { errors: formatZodError(result.error) },
      });
      return;
    }

    Object.assign(req[location], result.data);
    next();
  };
};
