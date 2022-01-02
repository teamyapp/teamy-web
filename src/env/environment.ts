export enum Environment {
    Development = 'development',
    Testing = 'testing',
    Staging = 'staging',
    Production = 'production',
}

export function getEnvironment(): Environment {
    return (
        (import.meta.env['VITE_ENVIRONMENT'] as Environment) ||
        Environment.Development
    );
}

export function getEnvVar(variable: string): string {
    const vars = window.Vars;
    return vars[variable] || '';
}
