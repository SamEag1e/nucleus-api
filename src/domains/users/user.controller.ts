import { Response } from 'express';

import { resUtil } from '@shared/utils/response.util';
import { MongoIdParam } from '@shared/schemas/mongo-id.schema';
import { TypedRequest } from '@shared/schemas/typed-request.type';
import { usersService } from './user.service';
import { UpdateUser } from './schemas/update-user.schema';
import { CreateUser } from './schemas/create-user.schema';
import { SimpleQuery } from '@shared/schemas/query-param.schema';
import { UsernameParam } from './schemas/username.schema';

class UserController {
  async findAll(req: TypedRequest<{}, {}, SimpleQuery>, res: Response) {
    const users = await usersService.findAll(req.query.q);

    return resUtil.success(res, { users });
  }

  async findOne(req: TypedRequest<MongoIdParam>, res: Response) {
    const user = await usersService.findOne(req.params.id);

    return resUtil.success(res, { user });
  }

  async usernameExists(req: TypedRequest<UsernameParam>, res: Response) {
    const existing = await usersService.findOneByUsername(req.params.username);

    return resUtil.success(res, { exists: existing ? true : false });
  }

  async create(req: TypedRequest<{}, CreateUser, {}>, res: Response) {
    const created = await usersService.create(req.body);

    return resUtil.success(res, { created }, 201);
  }

  async update(req: TypedRequest<MongoIdParam, UpdateUser>, res: Response) {
    const updated = await usersService.update(req.params.id, req.body);

    return resUtil.success(res, { updated });
  }
}

export const userController = new UserController();
