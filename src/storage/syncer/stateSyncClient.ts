import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { HTTPClient } from '@lib/network/HTTP.client';

export class StateSyncClient {
    constructor(
        private readonly connectionUrl: string,
        private readonly httpClient: HTTPClient,
    ) {
    }

    public sendClientIsReady(
        clientId: number,
    ): Promise<Result<string, Errors>> {
        return this.httpClient.request(
            `${this.connectionUrl}/real-time-state-sync/clients/${clientId}/initial-state-ready`,
            { 
                method: 'PUT'
            },
        );
    }
}
