import { Environment } from '../env/environment';

export interface Config {
    httpProtocol: string;
    webSocketProtocol: string;
    apiBaseEndpoint: string;
    cookieDomain: string;
    cookieSecure: boolean;
}

const developmentConfig: Config = {
    httpProtocol: 'http',
    webSocketProtocol: 'ws',
    apiBaseEndpoint: 'localhost:9500',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const testingConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'identity.testing.teamyapp.com',
    cookieDomain: 'testing.teamyapp.com',
    cookieSecure: true,
};

const stagingConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'identity.staging.teamyapp.com',
    cookieDomain: 'staging.teamyapp.com',
    cookieSecure: true,
};

const productionConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'identity.teamyapp.com',
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
