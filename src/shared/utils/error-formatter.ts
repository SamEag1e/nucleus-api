import { ZodError } from 'zod';

/**
 * Flattens a ZodError into an array of simple human-readable strings.
 * Example: ["body.email: Invalid email", "body.age: Expected number, received string"]
 */
export function formatZodError(error: ZodError, prefix = ''): string[] {
  return error.issues.map((issue) => {
    const path = [prefix, ...issue.path].filter(Boolean).join('.');
    return `${path}: ${issue.message}`;
  });
}

/**
 * Single-line compact string version (for logs)
 */
export function formatZodErrorInline(error: ZodError, prefix = ''): string {
  return formatZodError(error, prefix).join('; ');
}
