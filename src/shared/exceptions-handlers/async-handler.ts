import { NextFunction, Request, Response } from 'express';

export const asyncHandler = (fn: Function) => {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};
