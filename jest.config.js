/** @type {import('jest').Config} */

module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.(css|scss)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: ['/node_modules/(?!@patternfly/).+\\.(js|jsx|ts|tsx)$'],
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/playwright/', '\\.spec\\.'],
};
