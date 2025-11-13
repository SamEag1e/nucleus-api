import path from 'path';
import fs from 'fs';

import { createLogger, format, transports } from 'winston';
import { LogLevelEnum } from '@shared/enums/loglevel.enum';
import { getConfigService } from '@shared/services/config.service';

// Ensure logs folder exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

const configService = getConfigService();

// Create the logger
const logger = createLogger({
  level: configService.LOG_LEVEL || LogLevelEnum.INFO,
  format: logFormat,
  transports: [
    new transports.Console({
      format: configService.isDev
        ? format.combine(format.colorize(), format.simple())
        : format.json(),
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

export default logger;
