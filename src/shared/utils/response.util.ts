import { Response } from 'express';

export const resUtil = {
  success: (res: Response, data: any, code = 200) =>
    res.status(code).json({ status: 'success', data }),

  fail: (res: Response, data: any, code = 400) =>
    res.status(code).json({ status: 'fail', data }),

  error: (res: Response, error: Error, code = 500, data?: any) =>
    res.status(code).json({
      status: 'error',
      message: error.message,
      ...(data && { data }),
    }),
};
