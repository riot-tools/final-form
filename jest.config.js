// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {

    browser: true,
    coverageDirectory: "coverage",

    coveragePathIgnorePatterns: [
      "/node_modules/"
    ],

  moduleFileExtensions: [
    "js",
    "json",
    "riot"
  ],

    roots: [
      "<rootDir>/lib"
    ],

    testEnvironment: "jest-environment-jsdom",

    testMatch: [
      "**/__tests__/**/*.[jt]s?(x)",
      "**/?(*.)+(spec|test).[tj]s?(x)"
    ],

    transform: {
      "^.+\\.(js|jsx|ts)$": "babel-jest",
      "^.+\\.riot$": "riot-jest-transformer"
    },

    transformIgnorePatterns: [
      "/node_modules/"
    ]
};
