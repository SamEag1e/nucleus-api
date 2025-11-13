import mongoose from 'mongoose';

/**
 * Deeply transforms MongoDB documents:
 * - Converts `_id` → `id: string`
 * - Removes `__v`
 * - Converts any nested ObjectId values to strings
 */
export const transformMongoDoc = <T extends Record<string, any>>(
  doc: T
): Omit<T, '_id' | '__v'> & { id: string } => {
  const transformValue = (value: any): any => {
    if (value instanceof mongoose.Types.ObjectId) {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.map(transformValue);
    }
    return value;
  };

  const { _id, __v, ...rest } = doc;
  const transformed = Object.fromEntries(
    Object.entries(rest).map(([k, v]) => [k, transformValue(v)])
  );

  return { id: String(_id), ...(transformed as any) };
};
