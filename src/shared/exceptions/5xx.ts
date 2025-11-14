import { AppError } from './app-error';

export class BadGatewayError extends AppError {
  constructor(message?: string) {
    super(message ?? 'BadGatewayError', 502);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message?: string) {
    super(message ?? 'Service Unavailable', 503);
  }
}
