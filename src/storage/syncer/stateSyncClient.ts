import { InternalError } from '@lib/error/errors';
import { HTTPClient, HTTPResponse } from '@lib/network/HTTP.client';
import { Optional } from '@lib/sugar/optional';

export class StateSyncClient {
    constructor(
        private readonly connectionUrl: string,
        private readonly httpClient: HTTPClient,
    ) {}

    public sendInitialStateIsReady(
        clientId: number,
    ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> {
        return this.httpClient.request(
            `${this.connectionUrl}/real-time-state-sync/clients/${clientId}/initial-state-ready`,
            {
                method: 'PUT',
            },
        );
    }
}
