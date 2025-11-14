import { userModel } from './models/user.model';
import { ExposeUser, userZodSchema } from './schemas/user.schema';
import { UpdateUser } from './schemas/update-user.schema';
import { CreateUser } from './schemas/create-user.schema';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@shared/exceptions/4xx';
import logger from '@shared/logger/logger';

class UsersService {
  async findAll(q?: string): Promise<ExposeUser[]> {
    const filter = q
      ? {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { lastName: { $regex: q, $options: 'i' } },
            { userName: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const users = await userModel.find(filter).lean();

    const parsedUsers = users
      .map((user) => userZodSchema.safeParse(user))
      .filter((res) => res.success)
      .map((res) => res.data);

    return parsedUsers;
  }

  async findOne(id: string): Promise<ExposeUser> {
    const user = await userModel.findById(id).lean();
    if (!user) throw new NotFoundError('User');

    const parsed = userZodSchema.safeParse(user);
    if (!parsed.success) {
      logger.error(`[DB] User id:${id} has invalid data`, user);
      throw new NotFoundError('User');
    }

    return parsed.data;
  }

  async findOneByUsername(username: string): Promise<ExposeUser | null> {
    const user = await userModel.findOne({ username }).lean();
    if (!user) return null;

    const parsed = userZodSchema.safeParse(user);
    if (!parsed.success) {
      logger.error(`[DB] User ${username} has invalid data`, user);
      return null;
    }

    return parsed.data;
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
