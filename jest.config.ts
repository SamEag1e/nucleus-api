import type { Config } from 'jest';
require('dotenv').config({ path: '.env' });

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@domains/(.*)$': '<rootDir>/src/domains/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!**/types/**',
    '!**/consts/**',
    '!**/enums/**',
    '!**/schemas/**',
    '!**/models/**',
    '!**/database/**',
    '!**/swagger/**',
    '!**/*.routes.ts',
    '!**/*.schema.ts',
    '!**/*.type.ts',
    '!**/*.const.ts',
    '!**/*.register.ts',
    '!src/main.ts',
  ],
};

export default config;
