import { RefObject } from 'react';

import { Deps } from '@core/dep/deps';
import {
    appRoutes,
    publicRoutes,
    rootRoutePattern,
    sprintsRoutes,
    teamsRoutes,
} from '@core/routing/routes';

import { AppComponent } from '../components/App.component';
import { addRouteInterceptors } from './interceptors';

export function initRouter(deps: Deps, appRef: RefObject<AppComponent>) {
    deps.router.registerRoute(rootRoutePattern, false);

    for (const route of publicRoutes) {
        deps.router.registerRoute(route, false);
    }

    for (const route of appRoutes) {
        deps.router.registerRoute(route, false);
    }

    for (const route of teamsRoutes) {
        deps.router.registerRoute(route, false);
    }

    for (const route of sprintsRoutes) {
        deps.router.registerRoute(route, false);
    }

    addRouteInterceptors(deps, appRef);
}
