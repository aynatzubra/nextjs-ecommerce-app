import type { Config } from 'jest'

/** @jest-config-loader ts-node */

const config: Config = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.middleware.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
export default config
