/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  // ES module support via --experimental-vm-modules
};
