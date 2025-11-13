import { Response } from 'express';

import { ResponseStatusEnum } from '@shared/enums/response-status.enum';

export const resUtil = {
  success: (res: Response, data: any, code = 200) =>
    res.status(code).json({ status: ResponseStatusEnum.Success, data }),

  fail: (res: Response, data: any, code = 400) =>
    res.status(code).json({ status: ResponseStatusEnum.Fail, data }),

  error: (res: Response, error: Error, code = 500, data?: any) =>
    res.status(code).json({
      status: ResponseStatusEnum.Error,
      message: error.message,
      ...(data && { data }),
    }),
};
