/** @type {import('jest').Config} */
module.exports = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  snapshotSerializers: ["jest-shallow-serializer/serializer"],
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(t|j)sx?$": "babel-jest",
  },
};
