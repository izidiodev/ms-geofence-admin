import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleFileExtensions: ['ts', 'js'],
  collectCoverageFrom: [
    'src/modules/**/controllers/**/*.ts',
    'src/modules/**/services/**/*.ts',
    'src/modules/**/validations/**/*.ts',
    '!src/modules/**/__tests__/**',
    '!src/modules/**/I*.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@user/(.*)\\.[jt]s$': '<rootDir>/src/modules/user/$1',
    '^@type/(.*)\\.[jt]s$': '<rootDir>/src/modules/type/$1',
    '^@campaign/(.*)\\.[jt]s$': '<rootDir>/src/modules/campaign/$1',
    '^@auth/(.*)\\.[jt]s$': '<rootDir>/src/modules/auth/$1',
    '^@shared/(.*)\\.[jt]s$': '<rootDir>/src/shared/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.jest.json',
      },
    ],
  },
  };

export default config;
