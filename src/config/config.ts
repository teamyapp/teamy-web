import { Environment } from '@core/env/environment';

export const taskGoalLengthLimit = 100;

export interface Config {
    servicesWebAPIEndpoint: string;
    servicesWebSocketAPIEndpoint: string;
    cloudWebAPIEndpoint: string;
}

const developmentConfig: Config = {
    servicesWebAPIEndpoint: 'http://localhost:9000',
    servicesWebSocketAPIEndpoint: 'ws://localhost:9000',
    cloudWebAPIEndpoint: 'http://localhost:9011',
};

const testingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.testing.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.testing.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.testing.teamyapp.com',
};

const stagingConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.staging.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.staging.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.staging.teamyapp.com',
};

const productionConfig: Config = {
    servicesWebAPIEndpoint: 'https://web-backend.teamyapp.com',
    servicesWebSocketAPIEndpoint: 'wss://web-backend.teamyapp.com',
    cloudWebAPIEndpoint: 'https://cloud.teamyapp.com',
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
