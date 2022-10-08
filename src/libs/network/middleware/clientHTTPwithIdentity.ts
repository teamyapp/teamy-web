import { Errors } from "@lib/error/errors";
import { Result } from "@lib/error/result";
import { HTTPClient } from "../HTTP.client";
import { HTTPClientMiddleware } from "./middleware";
import { getAccessToken } from "@lib/identity/Identity.client";


export const clientHTTPwithIdentity: HTTPClientMiddleware = (httpClient: HTTPClient): HTTPClient => {
    return {
        request: (
            url: string,
            options?: {
                method: string;
                headers?: Record<string, string>;
                body?: string;
            },
        ): Promise<Result<string, Errors>> => {
            debugger
            return httpClient.request(
                url,
                {
                    ...options,
                    method: options?.method || "GET",
                    headers: {
                        ...options?.headers,
                        Authorization: `Bearer ${getAccessToken()}`,
                    }
                }
            )
        }
    }
}