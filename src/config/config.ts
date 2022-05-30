import { Environment } from '@core/env/environment';

export const taskGoalLengthLimit = 100;

export interface Config {
    teamyGraphQLEndpoint: string;
    teamyGraphQLV2Endpoint: string;
}

const developmentConfig: Config = {
    teamyGraphQLEndpoint: 'http://localhost:9000/graphql',
    teamyGraphQLV2Endpoint: 'http://localhost:9001/graphql',
};

const testingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.testing.teamyapp.com/graphql',
    teamyGraphQLV2Endpoint: 'https://backend-v2.testing.teamyapp.com/graphql',
};

const stagingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.staging.teamyapp.com/graphql',
    teamyGraphQLV2Endpoint: 'https://backend-v2.staging.teamyapp.com/graphql',
};

const productionConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.teamyapp.com/graphql',
    teamyGraphQLV2Endpoint: 'https://backend-v2.teamyapp.com/graphql',
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
