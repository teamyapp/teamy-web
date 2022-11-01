import { InternalError } from '@lib/error/errors';
import { Result } from '@lib/error/result';
import { HTTPClient } from '@lib/network/HTTP.client';
import { Props } from './Props';

export class TelemetryClient {
    constructor(
        private readonly telemetryApiEndpoint: string,
        private readonly httpClient: HTTPClient,
    ) {}

    public uploadLog(
        logEntries: Props[]
    ): Promise<Result<string, InternalError>> {
        return this.httpClient.request(
            `${this.telemetryApiEndpoint}/telemetry/upload-log`,
            {
                method: 'POST',
                body: JSON.stringify(logEntries)
            },
        );
    }
}
