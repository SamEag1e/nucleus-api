import { z } from 'zod';

import {
  errorResponse,
  failResponse,
  successResponse,
} from '../utils/responses.utils';
import { registry } from '../swagger';
import { mongoIdParamSchema } from '@shared/schemas/mongo-id.schema';
import { simpleQuerySchema } from '@shared/schemas/query-param.schema';
import { userZodSchema } from '@domains/users/schemas/user.schema';
import { userCreateZodSchema } from '@domains/users/schemas/create-user.schema';
import { userUpdateZodSchema } from '@domains/users/schemas/update-user.schema';
import { usernameParamZodSchema } from '@domains/users/schemas/username.schema';

registry.registerPath({
  method: 'get',
  path: '/users',
  description: 'List all users (optionally filtered by query string)',
  request: {
    query: simpleQuerySchema,
  },
  responses: {
    200: successResponse('List of users', {
      users: z.array(userZodSchema),
    }),
    400: failResponse(),
    500: errorResponse(),
  },
  tags: ['Users'],
});

registry.registerPath({
  method: 'get',
  path: '/users/{id}',
  request: { params: mongoIdParamSchema },
  responses: {
    200: successResponse('Single user', { user: userZodSchema }),
    400: failResponse(),
    404: failResponse(),
    500: errorResponse(),
  },
  tags: ['Users'],
});

registry.registerPath({
  method: 'get',
  path: '/users/exists/{username}',
  request: { params: usernameParamZodSchema },
  responses: {
    200: successResponse('Check if a username exists in db.', {
      exists: z.boolean(),
    }),
    400: failResponse(),
    404: failResponse(),
    500: errorResponse(),
  },
  tags: ['Users'],
});

registry.registerPath({
  method: 'post',
  path: '/users',
  request: {
    body: {
      content: { 'application/json': { schema: userCreateZodSchema } },
    },
  },
  responses: {
    201: successResponse('Single user', { user: userZodSchema }),
    400: failResponse(),
    404: failResponse(),
    500: errorResponse(),
  },
  tags: ['Users'],
});

registry.registerPath({
  method: 'put',
  path: '/users',
  request: {
    params: mongoIdParamSchema,
    body: {
      content: { 'application/json': { schema: userUpdateZodSchema } },
    },
  },
  responses: {
    200: successResponse('Single user', { user: userZodSchema }),
    400: failResponse(),
    404: failResponse(),
    500: errorResponse(),
  },
  tags: ['Users'],
});
