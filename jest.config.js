const fs = require('fs');
const swcConfig = JSON.parse(fs.readFileSync(`${__dirname}/.swcrc`, 'utf-8'));

module.exports = {
    roots: ['<rootDir>/src'],
    preset: 'vite-jest',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.{spec,test}.{js,jsx,ts,tsx}',
    ],
    testEnvironment: 'jest-environment-jsdom',
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', { ...swcConfig }],
    },
    moduleNameMapper: {
        '^@core/(.*)': '<rootDir>/src/$1',
        '^@lib/(.*)': '<rootDir>/src/libs/$1',
        '\\.(css|sass|scss)$': 'identity-obj-proxy',
    },
};
