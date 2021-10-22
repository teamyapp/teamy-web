import { Environment } from '../env/environment';

export interface Config {
    apiBaseUrl: string;
    webSocketUrl: string;
}

const developmentConfig: Config = {
    apiBaseUrl: '',
    webSocketUrl: '',
};

const testingConfig: Config = {
    apiBaseUrl: '',
    webSocketUrl: '',
};

const stagingConfig: Config = {
    apiBaseUrl: '',
    webSocketUrl: '',
};

const productionConfig: Config = {
    apiBaseUrl: '',
    webSocketUrl: '',
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
