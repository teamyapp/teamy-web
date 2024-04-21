import { RouteUpdate } from './router';

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
