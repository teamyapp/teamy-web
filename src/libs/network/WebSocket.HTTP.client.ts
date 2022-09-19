import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';

import { WithIdentity } from './WithIdentity';

export class WebSocketHttpClient {
    constructor(
        private readonly connectionUrl: string,
        private readonly httpClientWithIdentity: WithIdentity,
    ) {}

    public sendClientIsReady(
        clientId: number,
    ): Promise<Result<string, Errors>> {
        return this.httpClientWithIdentity.request(
            `${this.connectionUrl}/real-time-state-sync/clients/${clientId}/initial-state-ready`,
            { 
                method: 'PUT'
            },
        );
    }
}
