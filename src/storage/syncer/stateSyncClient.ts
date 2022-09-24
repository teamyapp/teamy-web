import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { HTTPClient } from '@lib/network/HTTP.client';

import { WithIdentity } from '@lib/network/WithIdentity';

export class StateSyncClient {

    private withIdentityHttpClient: WithIdentity

    constructor(
        private readonly connectionUrl: string,
        private readonly httpClient: HTTPClient,
    ) {
        this.withIdentityHttpClient = new WithIdentity(this.httpClient)
    }

    public sendClientIsReady(
        clientId: number,
    ): Promise<Result<string, Errors>> {
        return this.withIdentityHttpClient.request(
            `${this.connectionUrl}/real-time-state-sync/clients/${clientId}/initial-state-ready`,
            { 
                method: 'PUT'
            },
        );
    }
}
