/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  moduleNameMapper: {
    "^components/(.*)$": "<rootDir>/src/components/$1",
    "^assets/(.*)$": "<rootDir>/src/assets/$1",
    "^helpers/(.*)$": "<rootDir>/src/helpers/$1",
    "^HOCS/(.*)$": "<rootDir>/src/HOCS/$1",
    "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^multiLanguage/(.*)$": "<rootDir>/src/multiLanguage/$1",
    "^reduxConfig/(.*)$": "<rootDir>/src/reduxConfig/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
    "^static/(.*)$": "<rootDir>/src/static/$1",
    "react-local-translations":
      "<rootDir>/src/multiLanguage/react-local-translations",
    "\\.(css|less)$": "identity-obj-proxy",
    "^uuid$": "uuid",
  },
  preset: "ts-jest",
  setupFiles: ["./tools/jest.polyfills.js"],
  setupFilesAfterEnv: ["./tools/setupJest.js"],
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  testMatch: ["**/?(*.)+(spec|test).+(ts|tsx|js)"],
  transform: {
    "^.+\\.(ts|tsx)?$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest",
    "^.+\\.svg$": "<rootDir>/tools/jestSvgTransform.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(redux-persist|redux-persist/es/integration/react|redux-persist/es/stateReconciler/autoMergeLevel2)/)",
  ],
};
