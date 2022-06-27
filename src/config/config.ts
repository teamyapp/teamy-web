import { Environment } from '@core/env/environment';

export const taskGoalLengthLimit = 100;

export interface Config {
    teamyGraphQLEndpoint: string;
    servicesWebAPIEndpoint: string;
    servicesWebSocketEndpoint: string;
}

const developmentConfig: Config = {
    teamyGraphQLEndpoint: 'http://localhost:9000/graphql',
    servicesWebAPIEndpoint: 'http://localhost:9001',
    servicesWebSocketEndpoint: 'ws://localhost:9001',
};

const testingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.testing.teamyapp.com/graphql',
    servicesWebAPIEndpoint: 'https://services-backend.testing.teamyapp.com',
    servicesWebSocketEndpoint: 'wss://services-backend.testing.teamyapp.com',
};

const stagingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.staging.teamyapp.com/graphql',
    servicesWebAPIEndpoint: 'https://services-backend.staging.teamyapp.com',
    servicesWebSocketEndpoint: 'wss://services-backend.staging.teamyapp.com',
};

const productionConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.teamyapp.com/graphql',
    servicesWebAPIEndpoint: 'https://services-backend.teamyapp.com',
    servicesWebSocketEndpoint: 'wss://services-backend.teamyapp.com',
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
