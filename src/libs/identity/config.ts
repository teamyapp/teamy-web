import { Environment } from '@core/env/environment';

export interface Config {
    apiBaseEndpoint: string;
    cookieDomain: string;
    cookieSecure: boolean;
}

const developmentConfig: Config = {
    apiBaseEndpoint: 'http://localhost:9500/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const testingConfig: Config = {
    apiBaseEndpoint: 'https://cloud.testing.teamyapp.com/identity',
    cookieDomain: 'testing.teamyapp.com',
    cookieSecure: true,
};

const stagingConfig: Config = {
    apiBaseEndpoint: 'https://cloud.staging.teamyapp.com/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const productionConfig: Config = {
    apiBaseEndpoint: 'https://cloud.teamyapp.com/identity',
    cookieDomain: 'teamyapp.com',
    cookieSecure: true,
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
