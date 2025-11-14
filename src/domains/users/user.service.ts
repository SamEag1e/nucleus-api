import { userModel } from './models/user.model';
import { ExposeUser } from './schemas/user.schema';
import { UpdateUser } from './schemas/update-user.schema';
import { CreateUser } from './schemas/create-user.schema';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@shared/exceptions/4xx';

class UsersService {
  async findAll(): Promise<ExposeUser[]> {
    const users = await userModel.find().lean();

    return users;
  }

  async findOne(id: string): Promise<ExposeUser> {
    const user = await userModel.findById(id).lean();

    if (!user) throw new NotFoundError('User');

    return user;
  }

  async create(data: CreateUser): Promise<ExposeUser> {
    throw new BadRequestError();
    // TODO:
  }

  async update(id: string, data: UpdateUser): Promise<ExposeUser> {
    throw new BadRequestError();
    // TODO:
  }
}

export const usersService = new UsersService();
