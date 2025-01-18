/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}"],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "html", "cobertura"],
  coveragePathIgnorePatterns: ["TestComponent*"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./",
        suiteNameTemplate: "{filepath}",
        classNameTemplate: "{classname}",
        addConsoleOutput: "true",
      },
    ],
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "TestComponent*"],
  transform: {
    "^.+\\.(t|j)sx?$": "@swc/jest",
  },
};
