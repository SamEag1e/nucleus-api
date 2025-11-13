import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { getConfigService } from '@shared/services/config.service';

export const registry = new OpenAPIRegistry();

export const generateSwaggerDocument = () => {
  const configService = getConfigService();
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${configService.APP_PORT}/api/v1` }],
  });
};
