type JsonSchemaProperty =
  | {
      // MongoDB valid BSON types
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
      // Nested object support
      properties?: Record<string, JsonSchemaProperty>;
      items?: JsonSchemaProperty; // For arrays
      default?: any; // optional default value (not enforced by Mongo)
    }
  | { [key: string]: any };

export type JsonSchema = {
  bsonType: 'object';
  required?: string[];
  properties: Record<string, JsonSchemaProperty>;
};
