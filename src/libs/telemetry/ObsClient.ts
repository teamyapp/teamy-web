import { Errors } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { HTTPClient } from '@lib/network/HTTP.client';
import { Props } from './Props';

export class ObsClient {
    constructor(
        private readonly connectionUrl: string,
        private readonly httpClient: HTTPClient,
    ) {}

    public uploadLog(
        logEntries: Props[]
    ): Promise<Result<string, Errors>> {
        return this.httpClient.request(
            `${this.connectionUrl}/monitor/upload-log`,
            {
                method: 'POST',
                body: JSON.stringify(logEntries)
            },
        );
    }
}
