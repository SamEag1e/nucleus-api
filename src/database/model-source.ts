import { JsonSchema } from '@shared/schemas/json-schema.type';

import { userJsonSchema } from '@domains/users/models/user.json.schema';

export const modelSource: {
  collectionName: string;
  jsonSchema: JsonSchema;
}[] = [
  { collectionName: 'users', jsonSchema: userJsonSchema },
  // { collectionName: 'something', jsonSchema: somethingJsonSchema },
];
