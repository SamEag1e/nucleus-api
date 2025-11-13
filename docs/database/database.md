# Database Setup Guide

## Overview

This project uses MongoDB with optional, strict JSON Schema validation.  
If you prefer the default Mongoose behavior (`autoCreate: true`), you can ignore the BSON/validator system entirely.

The database utility scripts in this project provide:

- Initialization of collections with strict MongoDB validators
- Data integrity checks that compare stored documents against your Zod schemas

> For large datasets, `db:bson` and `db:healthcheck` may be slow or memory-intensive. Consider adding batching/pagination if needed.

---

## 1. Apply BSON Schemas

Run:

```bash
npm run build
npm run db:bson
```

This will:

- Apply BSON schemas and collection-level validators
- Load compiled schema definitions from `dist/database/json-schemas.js`
- Create or update validators for each collection defined in `modelSource`

Use it when initializing a new environment or after updating schema definitions.

---

## 2. Run Health Check

```bash
npm run build
npm run db:healthcheck
```

This script:

- Verifies MongoDB connectivity
- Ensures collections exist and their validators are applied
- Checks existing documents against the corresponding Zod schemas

Recommended before deployments or migrations.

---

## How It Works

### JSON Schema Type Definition

```ts
// shared/schemas/json-schema.type.ts
type JsonSchemaProperty =
  | {
      bsonType:
        | 'string'
        | 'int'
        | 'double'
        | 'bool'
        | 'object'
        | 'array'
        | 'objectId'
        | 'date'
        | 'null';
      description?: string;
      enum?: any[];
      properties?: Record<string, JsonSchemaProperty>;
      items?: JsonSchemaProperty;
      default?: any;
    }
  | { [key: string]: any };

export type JsonSchema = {
  bsonType: 'object';
  required?: string[];
  properties: Record<string, JsonSchemaProperty>;
};
```

The goal is to keep BSON schema types strongly typed and consistent with MongoDB's native validator syntax.

---

## Example Schema

```ts
// src/domains/users/models/user.json.schema.ts
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
```

---

## Register Schemas in the Model Source

```ts
// src/database/model-source.ts
import { JsonSchema } from '@shared/schemas/json-schema.type';

export const modelSource: {
  collectionName: string;
  jsonSchema: JsonSchema;
}[] = [
  { collectionName: 'users', jsonSchema: userJsonSchema },
  // { collectionName: 'another', jsonSchema: anotherJsonSchema },
];
```

This file is the single source of truth for database-level validators.

---

## Mongoose Model Definition

```ts
// src/domains/users/models/user.model.ts
import mongoose from 'mongoose';

import { GenderEnum } from '@shared/enums/gender.enum';

const userMongoSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    gender: { type: String, enum: Object.values(GenderEnum) },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  {
    timestamps: true,
    strict: true,
    autoCreate: false,
  }
);

export const userModel = mongoose.model('User', userMongoSchema);
```

Notes:

- `autoCreate: false` ensures that collections are not implicitly created before validators are applied.
- This model is used in service-level CRUD operations.

---

## Health Check Usage

The model is also used during validation checks:

```ts
await checkCollection('users', userModel, userZodSchema);
```

This guarantees:

- The collection exists
- Validators match what you expect
- Database documents conform to your Zod-level application schema
