import { Environment } from '@core/env/environment';

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
    apiBaseEndpoint: 'localhost:9500/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const testingConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'cloud.testing.teamyapp.com/identity',
    cookieDomain: 'testing.teamyapp.com',
    cookieSecure: true,
};

const stagingConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'cloud.staging.teamyapp.com/identity',
    cookieDomain: 'localhost',
    cookieSecure: false,
};

const productionConfig: Config = {
    httpProtocol: 'https',
    webSocketProtocol: 'wss',
    apiBaseEndpoint: 'cloud.teamyapp.com/identity',
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
