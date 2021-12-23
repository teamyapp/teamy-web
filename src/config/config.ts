import { Environment } from '../env/environment';

export interface Config {
    teamyGraphQLEndpoint: string;
}

const developmentConfig: Config = {
    teamyGraphQLEndpoint: 'http://localhost:9000/graphql',
};

const testingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.testing.teamyapp.com/graphql',
};

const stagingConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.staging.teamyapp.com/graphql',
};

const productionConfig: Config = {
    teamyGraphQLEndpoint: 'https://backend.teamyapp.com/graphql',
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
