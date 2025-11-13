import './register'; // This must be at top

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

import router from './index.routes';
import { generateSwaggerDocument } from './swagger/swagger';
// import { errorHandler } from './shared/exception-handlers/error-handler';

export const createApp = (options: { isDev: boolean }) => {
  const app = express();
  //   const logger = getLogger();

  // Middlewares
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message) => {
          //   logger.info(message.trim());
        },
      },
      skip: (req, res) => {
        if (options.isDev) return false;

        return res.statusCode < 400;
      },
    })
  );

  if (options.isDev) {
    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(generateSwaggerDocument())
    );
  }

  // API routes
  app.use('/api/v2', router);

  //   // Global error handler
  //   app.use(errorHandler);

  return app;
};
