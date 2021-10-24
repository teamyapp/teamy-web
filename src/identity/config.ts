import { Environment } from '../env/environment';

export interface Config {
    apiBaseUrl: string;
    cookieDomain: string;
    cookieSecure: boolean;
}

const developmentConfig: Config = {
    apiBaseUrl: 'http://localhost:10000',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const testingConfig: Config = {
    apiBaseUrl: 'https://identity.testing.teamyapp.com',
    cookieDomain: 'testing.teamyapp.com',
    cookieSecure: true,
};

const stagingConfig: Config = {
    apiBaseUrl: 'https://identity.staging.teamyapp.com',
    cookieDomain: 'staging.teamyapp.com',
    cookieSecure: true,
};

const productionConfig: Config = {
    apiBaseUrl: 'https://identity.teamyapp.com',
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
