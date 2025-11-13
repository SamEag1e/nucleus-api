import { JsonSchema } from '@shared/schemas/json-schema.type';

export const userJsonSchema: JsonSchema = {
  bsonType: 'object',
  required: ['email', 'password'],
  properties: {
    firstName: { bsonType: 'string' },
    lastName: { bsonType: 'string' },
    gender: { bsonType: 'string' },
    email: { bsonType: 'string' },
    password: { bsonType: 'string' },
  },
};
