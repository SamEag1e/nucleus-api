import { registry } from '../swagger';

import { userZodSchema } from '@domains/users/schemas/user.schema';
import { userCreateZodSchema } from '@domains/users/schemas/create-user.schema';
import { changePasswordZodSchema } from '@domains/users/schemas/change-password.schema';

registry.register('ExposeUser', userZodSchema);
registry.register('CreateUser', userCreateZodSchema);
registry.register('ChangePassword', changePasswordZodSchema);
