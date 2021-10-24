export enum Environment {
    Development = 'development',
    Testing = 'testing',
    Staging = 'staging',
    Production = 'production',
}
export function getEnvironment(): Environment {
    return (
        (process.env[`REACT_APP_ENVIRONMENT`] as Environment) ||
        Environment.Development
    );
}
