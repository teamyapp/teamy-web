import { InternalError } from '@lib/error/errors';
import { HTTPClient, HTTPResponse } from '@lib/network/HTTP.client';
import { Optional } from '@lib/sugar/optional';

import { Props } from './Props';

export class TelemetryClient {
    constructor(
        private readonly telemetryApiEndpoint: string,
        private readonly httpClient: HTTPClient,
    ) {}

    public uploadLog(
        logEntries: Props[],
    ): Promise<[Optional<HTTPResponse>, Optional<InternalError>]> {
        return this.httpClient.request(
            `${this.telemetryApiEndpoint}/telemetry/upload-log`,
            {
                method: 'POST',
                body: JSON.stringify(
                    logEntries.map((logEntry) => JSON.stringify(logEntry)),
                ),
            },
        );
    }
}

