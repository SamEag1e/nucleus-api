import { Request, Response, NextFunction } from 'express';

import { resUtil } from '@shared/utils/response.util';
import { AppError } from '@shared/exceptions/app-error';
import logger from '@shared/logger/logger';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (
    err instanceof AppError &&
    err.statusCode >= 400 &&
    err.statusCode < 500
  ) {
    resUtil.fail(res, { errors: [err.message] }, err.statusCode);
    return;
  }

  if (err instanceof AppError && err.statusCode > 500) {
    resUtil.error(res, err, err.statusCode);
    return;
  }

  logger.error(err.message ?? 'Unexpected Error', err);
  resUtil.error(res, err);
};
