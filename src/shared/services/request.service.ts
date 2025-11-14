import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { times } from '@shared/utils/times';
import logger from '@shared/logger/logger';

class RequestsService {
  private readonly timeout = times.requestsTimeout;

  async get<T = any>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<
    | { success: true; data: T; headers: AxiosResponse<T>['headers'] }
    | { success: false; error: any }
  > {
    const started = Date.now();
    try {
      const response = await axios.get<T>(url, {
        ...config,
        timeout: this.timeout,
      });

      const duration = Date.now() - started;
      logger.debug(`[HTTP] GET ${url} -> ${response.status} in ${duration}ms`);

      return { success: true, data: response.data, headers: response.headers };
    } catch (error) {
      const duration = Date.now() - started;
      logger.error(`[HTTP] GET ${url} failed in ${duration}ms`, error);

      return this.handleRequestError(error);
    }
  }

  async post<T = any>(
    url: string,
    params: any,
    config: AxiosRequestConfig = {}
  ): Promise<
    | { success: true; data: T; headers: AxiosResponse<T>['headers'] }
    | { success: false; error: any }
  > {
    const started = Date.now();
    try {
      const response = await axios.post<T>(url, params, {
        ...config,
        timeout: this.timeout,
      });

      const duration = Date.now() - started;
      logger.debug(
        `[HTTP] POST ${url} -> ${response.status} in ${duration}ms`
      );

      return { success: true, data: response.data, headers: response.headers };
    } catch (error) {
      const duration = Date.now() - started;
      logger.error(`[HTTP] POST ${url} failed in ${duration}ms`, error);

      return this.handleRequestError(error);
    }
  }

  private handleRequestError(error: any): { success: false; error: any } {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        return { success: false, error: 'Request timeout' };
      }
      return {
        success: false,
        error: error.response?.data ?? error.message,
      };
    }
    return { success: false, error };
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
    let lastError;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (
          axios.isAxiosError(err) &&
          ['ECONNABORTED', 'ECONNRESET', 'ETIMEDOUT'].includes(err.code ?? '')
        ) {
          logger.debug(
            `[HTTP] transient error, retrying... attempt ${attempt + 1}`
          );
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  }
}

let instance: RequestsService | null = null;

export function getRequestsService() {
  if (!instance) {
    instance = new RequestsService();
  }
  return instance;
}

export function resetRequestsService() {
  instance = null;
}
