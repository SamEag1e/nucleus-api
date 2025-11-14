import express from 'express';

import { validate } from '@shared/middlewares/validate';
import { mongoIdParamSchema } from '@shared/schemas/mongo-id.schema';
import { userCreateZodSchema } from './schemas/create-user.schema';
import { userUpdateZodSchema } from './schemas/update-user.schema';
import { userController } from './user.controller';
import { asyncHandler } from '@shared/exceptions-handlers/async-handler';
import { simpleQuerySchema } from '@shared/schemas/query-param.schema';
import { usernameParamZodSchema } from './schemas/username.schema';

const router = express.Router();

router.get(
  '/',
  validate('query', simpleQuerySchema),
  asyncHandler(userController.findAll)
);

router.get(
  '/:id',
  validate('params', mongoIdParamSchema),
  asyncHandler(userController.findOne)
);

router.get(
  '/:id',
  validate('params', usernameParamZodSchema),
  asyncHandler(userController.usernameExists)
);

router.post(
  '/',
  validate('body', userCreateZodSchema),
  asyncHandler(userController.create)
);

router.put(
  '/:id',
  validate('params', mongoIdParamSchema),
  validate('body', userUpdateZodSchema),
  asyncHandler(userController.update)
);

export default router;
