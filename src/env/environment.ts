export enum Environment {
    Development = 'development',
    Testing = 'testing',
    Staging = 'staging',
    Production = 'production',
}
export function getEnvironment(): Environment {
    return (
        (process.env[`REACT_APP_ENV`] as Environment) || Environment.Development
    );
}
