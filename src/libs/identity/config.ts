import { Environment } from '@core/env/environment';

export interface Config {
    apiBaseEndpoint: string;
    cookieDomain: string;
    cookieSecure: boolean;
    signInLink: string;
    signInFinishLink: string;
}

const developmentConfig: Config = {
    apiBaseEndpoint: 'http://localhost:9500/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
    signInLink: '/cloud/identity/sign-in',
    signInFinishLink: '/cloud/identity/sign-in/finish',
};

const testingConfig: Config = {
    apiBaseEndpoint: 'https://cloud.testing.teamyapp.com/identity',
    cookieDomain: 'testing.teamyapp.com',
    cookieSecure: true,
    signInLink: '/cloud/identity/sign-in',
    signInFinishLink: '/cloud/identity/sign-in-finish',
};

const stagingConfig: Config = {
    apiBaseEndpoint: 'https://cloud.staging.teamyapp.com/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
    signInLink: '/cloud/identity/sign-in',
    signInFinishLink: '/cloud/identity/sign-in-finish',
};

const productionConfig: Config = {
    apiBaseEndpoint: 'https://cloud.teamyapp.com/identity',
    cookieDomain: 'teamyapp.com',
    cookieSecure: true,
    signInLink: '/cloud/identity/sign-in',
    signInFinishLink: '/cloud/identity/sign-in-finish',
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
