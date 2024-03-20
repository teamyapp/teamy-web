import { PopChannel, chan, multi } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';

export interface RouteUpdate {
    routePattern: string;
    suffix?: string;
    params: Params;
}

export interface Params {
    pathParams: Record<string, string>;
    queryParams: Record<string, string>;
}

interface Segment {
    isPath: boolean;
    children: Record<string, Segment>;
    pathParam?: string;
}

export type Errors =
    | 'ShouldNotHappen'
    | 'InvalidRoutePatten'
    | 'DuplicatedPathParam'
    | 'PathParamNotMatch'
    | 'InvalidUri'
    | 'InvalidQueryParam'
    | 'RouteNotFound';

const wildcard = '{*}';

const queryDelimiter = '?';
export const pathDelimiter = '/';
const paramDelimiter = '=';

interface NavigateOptions {
    skipDuplicate?: boolean;
    notifyRouteChange?: boolean;
}

export interface RouteInterceptorResult {
    isRedirected?: boolean;
    stopPipeline?: boolean;
}

export type RouteInterceptor = (
    router: Router,
    routeUpdate: RouteUpdate,
) => Promise<RouteInterceptorResult>;

export class Router {
    private readonly routeChangeChan = chan<RouteUpdate>();
    private readonly notifyRouteChangeChan = chan<RouteUpdate>();
    private readonly notifyRouteChangeChanMultiCaster = multi<RouteUpdate>(
        this.notifyRouteChangeChan,
    );
    private readonly root: Segment = {
        isPath: false,
        children: {},
    };
    private routeInterceptors: RouteInterceptor[] = [];
    private currUri?: string;
    private currRouteUpdate!: RouteUpdate;

    constructor() {
        window.addEventListener('popstate', this.onPopState);
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                await this.processRouteChange(routeUpdate);
            }
        })();
    }

    public get currentRouteUpdate(): RouteUpdate {
        return this.currRouteUpdate;
    }

    public get currentUri(): string | undefined {
        return this.currUri;
    }

    public addRouteInterceptor(interceptor: RouteInterceptor) {
        this.removeRouteInterceptor(interceptor);
        this.routeInterceptors = this.routeInterceptors.concat(interceptor);
    }

    public removeRouteInterceptor(interceptor: RouteInterceptor) {
        this.routeInterceptors = this.routeInterceptors.filter(
            (currInterceptor) => currInterceptor !== interceptor,
        );
    }

    public initBrowserUri() {
        const browserUri = `${window.location.pathname}${window.location.search}`;
        this.navigateTo(browserUri, {
            skipDuplicate: true,
        });
    }

    public registerRoute(
        routePattern: string,
        replayCurrUri: boolean = true,
    ): Errors | undefined {
        if (!routePattern) {
            return 'InvalidRoutePatten';
        }

        if (routePattern[0] !== pathDelimiter) {
            return 'InvalidRoutePatten';
        }

        if (routePattern === pathDelimiter) {
            this.root.isPath = true;
            if (replayCurrUri) {
                this.navigateToCurrUri();
            }
            return;
        }

        if (routePattern.includes(wildcard)) {
            return 'InvalidRoutePatten';
        }

        // TODO: process path parameter
        const segments = routePattern.substring(1).split(pathDelimiter);
        let currRoot = this.root;

        const pathParams = new Set<string>();
        let hasUpdated = false;

        for (let index = 0; index < segments.length; index++) {
            let segment = segments[index];
            let pathParam = undefined;
            if (isPathParameter(segment)) {
                pathParam = parseParamName(segment);
                if (pathParams.has(pathParam)) {
                    return 'DuplicatedPathParam';
                }

                pathParams.add(pathParam);
                segment = wildcard;
            }

            if (!currRoot.children[segment]) {
                currRoot.children[segment] = {
                    isPath: false,
                    children: {},
                };
                hasUpdated = true;
            }

            currRoot = currRoot.children[segment];
            if (pathParam) {
                if (!currRoot.pathParam) {
                    currRoot.pathParam = pathParam;
                    hasUpdated = true;
                } else if (currRoot.pathParam !== pathParam) {
                    return 'PathParamNotMatch';
                }
            }

            if (index === segments.length - 1) {
                currRoot.isPath = true;
                // if no pattern has been updated, then is no need to notify new subscribers who's pattern may match
                // the current uri
                if (hasUpdated && replayCurrUri) {
                    this.navigateToCurrUri();
                }
                return;
            }
        }
        return 'ShouldNotHappen';
    }

    public navigateTo(uri: string, options?: NavigateOptions): Errors | void {
        options = withDefaults(options);
        if (!uri || uri.length < 1) {
            return 'InvalidUri';
        }

        if (uri[0] !== pathDelimiter) {
            return 'InvalidUri';
        }

        if (options.skipDuplicate && uri === this.currUri) {
            return;
        }

        let path = decodeURI(uri);
        const queryParamStart = uri.indexOf(queryDelimiter);
        if (queryParamStart === 0) {
            return 'InvalidUri';
        } else if (queryParamStart > 0) {
            path = uri.substring(0, queryParamStart);
        }

        // TODO: parse path parameter
        const segments = path.substring(1).split(pathDelimiter);
        const params: Params = {
            pathParams: {},
            queryParams: {},
        };
        let currRoot = this.root;
        const routePattenSegments = [];
        let routeFound = this.root.isPath;
        let suffix: string | undefined;

        for (let index = 0; index < segments.length; index++) {
            const segment = segments[index];
            if (currRoot.children[segment]) {
                currRoot = currRoot.children[segment];
                routePattenSegments.push(segment);
            } else if (currRoot.children[wildcard]) {
                currRoot = currRoot.children[wildcard];
                params.pathParams[currRoot.pathParam!] = segment;
                routePattenSegments.push(`{${currRoot.pathParam}}`);
            } else {
                suffix = segments.slice(index).join(pathDelimiter);
                if (currRoot.isPath) {
                    routeFound = true;
                }
                break;
            }

            routeFound = routeFound || currRoot.isPath;
        }

        if (!routeFound) {
            return 'RouteNotFound';
        }

        const err = includeQueryParams(uri, queryParamStart, params);
        if (err) {
            return err;
        }

        this.currUri = uri;
        const routePattern = `${pathDelimiter}${routePattenSegments.join(
            pathDelimiter,
        )}`;

        window.history.pushState({}, '', uri);
        this.currRouteUpdate = {
            routePattern: routePattern,
            suffix,
            params: params,
        };

        if (options.notifyRouteChange) {
            this.routeChangeChan.put(this.currRouteUpdate);
        }
    }

    public subscribeRouteChange(): PopChannel<RouteUpdate | undefined> {
        const notifyChan = this.notifyRouteChangeChanMultiCaster.copy();
        if (this.currentRouteUpdate) {
            notifyChan.put(this.currentRouteUpdate);
        }

        return notifyChan;
    }

    public dispose() {
        closeIfNot(this.routeChangeChan);
    }

    public navigateToCurrUri() {
        if (this.currUri) {
            this.navigateTo(this.currUri, { skipDuplicate: false });
        }
    }

    private async processRouteChange(routeUpdate: RouteUpdate) {
        for (const interceptor of this.routeInterceptors) {
            const result = await interceptor(this, routeUpdate);
            if (result.isRedirected) {
                return;
            }

            if (result.stopPipeline) {
                break;
            }
        }

        this.notifyRouteChangeChan.put(routeUpdate);
    }

    private onPopState = () => {
        this.navigateTo(window.location.pathname);
    };
}

function includeQueryParams(
    uri: string,
    queryParamStart: number,
    params: Params,
): Errors | void {
    if (queryParamStart > 0) {
        const queryParamsString = uri.substring(queryParamStart + 1).split('&');
        for (const queryParamString of queryParamsString) {
            const parts = queryParamString.split(paramDelimiter);
            if (parts.length !== 2) {
                return 'InvalidQueryParam';
            }
            const queryParamName = parts[0];
            if (params.queryParams[queryParamName]) {
                return 'InvalidQueryParam';
            }
            params.queryParams[queryParamName] = parts[1];
        }
    }
}

export function sanitizeRoutePattern(routePattern: string): string {
    if (
        routePattern.length > 1 &&
        routePattern[routePattern.length - 1] === '/'
    ) {
        return routePattern.substring(0, routePattern.length - 1);
    }
    return routePattern;
}

function parseParamName(segment: string): string {
    return segment.slice(1, segment.length - 1);
}

function isPathParameter(segment: string): boolean {
    if (!segment || segment.length < 3) {
        return false;
    }
    return segment[0] === '{' && segment[segment.length - 1] === '}';
}

function withDefaults(options?: NavigateOptions): NavigateOptions {
    const newOptions: NavigateOptions = options || {};
    if (newOptions.skipDuplicate === undefined) {
        newOptions.skipDuplicate = true;
    }

    if (newOptions.notifyRouteChange === undefined) {
        newOptions.notifyRouteChange = true;
    }

    return newOptions;
}

export function exactMatch(routeUpdate: RouteUpdate, pattern: string): boolean {
    const suffixLength = routeUpdate.suffix?.length || 0;
    return routeUpdate.routePattern === pattern && suffixLength === 0;
}

export function includePrefix(patterns: string[], input: string): boolean {
    for (const pattern of patterns) {
        if (input.startsWith(pattern)) {
            return true;
        }
    }

    return false;
}

