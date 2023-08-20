import { LogLevel } from '@lib/telemetry/LogLevel';

import { Environment } from '@core/env/environment';

export const taskGoalLengthLimit = 100;

export interface Config {
    servicesWebAPIEndpoint: string;
    servicesWebSocketAPIEndpoint: string;
    cloudWebAPIEndpoint: string;
    defaultLogLevel: LogLevel;
    maxAPIRetryTimes: number;
    longBackOffMinDelay: number;
    longBackOffMaxDelay: number;
}

const developmentConfig: Config = {
    servicesWebAPIEndpoint: 'http://localhost:9000',
    servicesWebSocketAPIEndpoint: 'ws://localhost:9000',
    cloudWebAPIEndpoint: 'http://localhost:9011',
    defaultLogLevel: 'Debug',
    maxAPIRetryTimes: 10,
    longBackOffMinDelay: 10 * 60 * 1000,
    longBackOffMaxDelay: 60 * 60 * 1000,
};

const testingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.testing.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.testing.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.testing.teamyapp.com',
    defaultLogLevel: 'Debug',
    maxAPIRetryTimes: 10,
    longBackOffMinDelay: 10 * 60 * 1000,
    longBackOffMaxDelay: 60 * 60 * 1000,
};

const stagingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.staging.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.staging.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.staging.teamyapp.com',
    defaultLogLevel: 'Info',
    maxAPIRetryTimes: 10,
    longBackOffMinDelay: 10 * 60 * 1000,
    longBackOffMaxDelay: 60 * 60 * 1000,
};

const productionConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.teamyapp.com',
    defaultLogLevel: 'Info',
    maxAPIRetryTimes: 10,
    longBackOffMinDelay: 10 * 60 * 1000,
    longBackOffMaxDelay: 60 * 60 * 1000,
};

export function getConfig(env: Environment): Config {
    switch (env) {
        case Environment.Development:
            return developmentConfig;
        case Environment.Testing:
            return testingConfig;
        case Environment.Staging:
            return stagingConfig;
        case Environment.Production:
            return productionConfig;
    }
}
