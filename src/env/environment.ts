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

export function getEnvVar(variable: string): string {
    const variables = process.env.variables as any;
    return variables[variable] || '';
}
