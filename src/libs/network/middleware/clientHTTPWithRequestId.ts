import { Errors } from "@lib/error/errors";
import { Result } from "@lib/error/result";
import { v4 as uuidv4 } from 'uuid';
import { HTTPClient } from "../HTTP.client";
import { HTTPClientMiddleware } from "./middleware";
import {REQUEST_ID_HEADER} from "./headers";


export const clientHTTPWithRequestId: HTTPClientMiddleware = (httpClient: HTTPClient): HTTPClient => {
    return {
        request: (
            url: string,
            options?: {
                method: string;
                headers?: Record<string, string>;
                body?: string;
            },
        ): Promise<Result<string, Errors>> => {
            return httpClient.request(
                url, 
                {
                    ...options,
                    method: options?.method || "GET",
                    headers: {
                        ...options?.headers,
                        [REQUEST_ID_HEADER]: uuidv4()
                    }
                }
            )
        }
    }
}