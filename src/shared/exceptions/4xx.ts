import { AppError } from './app-error';

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('Forbidden', 403);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

export class ConflictError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} already exists`, 409);
  }
}

export class BadRequestError extends AppError {
  constructor(message?: string) {
    super(message ?? 'Invalid input', 400);
  }
}
