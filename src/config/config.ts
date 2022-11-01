import { Environment } from '@core/env/environment';
import { LogLevel } from '@lib/telemetry/LogLevel';

export const taskGoalLengthLimit = 100;

export interface Config {
    servicesWebAPIEndpoint: string;
    servicesWebSocketAPIEndpoint: string;
    cloudWebAPIEndpoint: string;
    defaultLogLevel: LogLevel
}

const developmentConfig: Config = {
    servicesWebAPIEndpoint: 'http://localhost:9000',
    servicesWebSocketAPIEndpoint: 'ws://localhost:9000',
    cloudWebAPIEndpoint: 'http://localhost:9011',
    defaultLogLevel: 'Debug'
};

const testingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.testing.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.testing.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.testing.teamyapp.com',
    defaultLogLevel: 'Debug'
};

const stagingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.staging.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.staging.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.staging.teamyapp.com',
    defaultLogLevel: 'Info'
};

const productionConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.teamyapp.com',
    defaultLogLevel: 'Info'
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
