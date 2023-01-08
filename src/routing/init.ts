import { Deps } from '@core/dep/deps';
import { RefObject } from 'react';
import { AppComponent } from '../components/App.component';
import {
    appRoutes,
    publicRoutes,
    rootRoutePattern,
    sprintsRoutes,
    teamsRoutes
} from '@core/config/routing';
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