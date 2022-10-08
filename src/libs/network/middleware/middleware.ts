import { HTTPClient } from '../HTTP.client';

export type HTTPClientMiddleware = (httpClient: HTTPClient) => HTTPClient;

export function httpClientWithMiddlewares(
    httpClient: HTTPClient,
    middlewares: HTTPClientMiddleware[],
): HTTPClient {
    if (middlewares.length === 0) {
        return httpClient;
    }

    return middlewares[0](
        httpClientWithMiddlewares(httpClient, middlewares.slice(1)),
    );
}
