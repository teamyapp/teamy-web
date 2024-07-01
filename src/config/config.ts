import { LogLevel } from '@lib/telemetry/LogLevel';

export const taskGoalLengthLimit = 100;

export interface Config {
    environment: string;
    servicesWebAPIEndpoint: string;
    servicesWebRPCAPIEndpoint: string;
    servicesWebSocketAPIEndpoint: string;
    cloudWebAPIEndpoint: string;
    defaultLogLevel: LogLevel;
    maxAPIRetryTimes: number;
    longBackOffMinDelayMs: number;
    longBackOffMaxDelayMs: number;
    identityApiBaseEndpoint: string;
    identityCookieDomain: string;
    identityCookieSecure: boolean;
    identitySignInLink: string;
    identitySignInFinishLink: string;
}

export function getConfig(): Config {
    return {
        environment: import.meta.env.VITE_ENVIRONMENT,
        servicesWebAPIEndpoint: import.meta.env.VITE_SERVICES_WEB_API_ENDPOINT,
        servicesWebRPCAPIEndpoint: import.meta.env
            .VITE_SERVICES_WEB_RPC_API_ENDPOINT,
        servicesWebSocketAPIEndpoint: import.meta.env
            .VITE_SERVICES_WEB_SOCKET_API_ENDPOINT,
        cloudWebAPIEndpoint: import.meta.env.VITE_CLOUD_WEB_API_ENDPOINT,
        defaultLogLevel: import.meta.env.VITE_DEFAULT_LOG_LEVEL,
        maxAPIRetryTimes: JSON.parse(import.meta.env.VITE_MAX_API_RETRY_TIMES),
        longBackOffMinDelayMs: JSON.parse(
            import.meta.env.VITE_LONG_BACK_OFF_MIN_DELAY_MS,
        ),
        longBackOffMaxDelayMs: JSON.parse(
            import.meta.env.VITE_LONG_BACK_OFF_MAX_DELAY_MS,
        ),
        identityApiBaseEndpoint: import.meta.env
            .VITE_IDENTITY_API_BASE_ENDPOINT,
        identityCookieDomain: import.meta.env.VITE_IDENTITY_COOKIE_DOMAIN,
        identityCookieSecure: JSON.parse(
            import.meta.env.VITE_IDENTITY_COOKIE_SECURE,
        ),
        identitySignInLink: import.meta.env.VITE_IDENTITY_SIGN_IN_LINK,
        identitySignInFinishLink: import.meta.env
            .VITE_IDENTITY_SIGN_IN_FINISH_LINK,
    };
}
