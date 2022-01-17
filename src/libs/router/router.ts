import { PopChannel, chan, multi } from '@lib/csp/csp';

export interface RouteUpdate {
    pathPattern: string;
    params: Params;
}

export interface Params {
    pathParams: { [key: string]: string };
    queryParams: { [key: string]: string };
}

interface Segment {
    isPath: boolean;
    children: { [pattern: string]: Segment };
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
const pathDelimiter = '/';
const paramDelimiter = '=';

export class Router {
    private readonly routeChangeChan = chan<RouteUpdate>();
    private readonly routeChangeMultiCaster = multi<RouteUpdate>(
        this.routeChangeChan,
    );
    private readonly root: Segment = {
        isPath: false,
        children: {},
    };
    private currUri?: string;

    public browserInit() {
        this.currUri = window.location.pathname;

        window.addEventListener('popstate', this.onPopState);
    }

    public registerRoute(routePattern: string): Errors | undefined {
        if (!routePattern) {
            return 'InvalidRoutePatten';
        }

        if (routePattern[0] !== pathDelimiter) {
            return 'InvalidRoutePatten';
        }

        if (routePattern === pathDelimiter) {
            this.root.isPath = true;
            this.navigateToCurrUri();
            return;
        }

        if (routePattern.includes(wildcard)) {
            return 'InvalidRoutePatten';
        }

        // TODO: process path parameter
        const segments = routePattern.substring(1).split(pathDelimiter);
        let currRoot = this.root;

        const pathParams = new Set<string>();

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
            }

            currRoot = currRoot.children[segment];
            if (pathParam) {
                if (!currRoot.pathParam) {
                    currRoot.pathParam = pathParam;
                } else if (currRoot.pathParam !== pathParam) {
                    return 'PathParamNotMatch';
                }
            }

            if (index === segments.length - 1) {
                currRoot.isPath = true;
                this.navigateToCurrUri();
                return;
            }
        }
        return 'ShouldNotHappen';
    }

    public navigateTo(uri: string, force: boolean = false): Errors | void {
        if (!uri || uri.length < 1) {
            return 'InvalidUri';
        }

        if (uri[0] !== pathDelimiter) {
            return 'InvalidUri';
        }

        if (!force && uri === this.currUri) {
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

        for (const segment of segments) {
            if (currRoot.children[segment]) {
                currRoot = currRoot.children[segment];
                routePattenSegments.push(segment);
            } else if (currRoot.children[wildcard]) {
                currRoot = currRoot.children[wildcard];
                params.pathParams[currRoot.pathParam!] = segment;
                routePattenSegments.push(`{${currRoot.pathParam}}`);
            } else if (!currRoot.isPath) {
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
        const pathPattern = `${pathDelimiter}${routePattenSegments.join(
            pathDelimiter,
        )}`;

        window.history.pushState({}, '', uri);
        this.routeChangeChan.put({
            pathPattern: pathPattern,
            params: params,
        });
    }

    public subscribeRouteChange(): PopChannel<RouteUpdate | undefined> {
        return this.routeChangeMultiCaster.copy();
    }

    public dispose() {
        this.routeChangeChan.close();
    }

    private navigateToCurrUri() {
        if (this.currUri) {
            this.navigateTo(this.currUri, true);
        }
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

export function sanitizePathPattern(pathPattern: string): string {
    if (pathPattern.length > 1 && pathPattern[pathPattern.length - 1] === '/') {
        return pathPattern.substring(0, pathPattern.length - 1);
    }
    return pathPattern;
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
