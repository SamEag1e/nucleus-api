import { JsonSchema } from '@shared/schemas/json-schema.type';

export const userJsonSchema: JsonSchema = {
  bsonType: 'object',
  required: ['username', 'password'],
  properties: {
    username: { bsonType: 'string' },
    password: { bsonType: 'string' },

    firstName: { bsonType: 'string' },
    lastName: { bsonType: 'string' },
    gender: { bsonType: 'string' },
  },
};
