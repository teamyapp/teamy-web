import { RefObject } from 'react';

import { IdentityClient } from '@lib/identity/Identity.client';
import {
    RouteInterceptor,
    RouteInterceptorResult,
    RouteUpdate,
    Router,
} from '@lib/router/router';

import { defaultSprintTabId, sprintTabIds } from '@core/config/sprints';
import { Deps } from '@core/dep/deps';
import {
    appRoutes,
    getSprintId,
    getTabId,
    getTaskId,
    getTeamId,
    publicRoutes,
    signUpRoutePattern,
    sprintTabPath,
    sprintTabRoutePattern,
    sprintsRoutePattern,
    taskRoutePattern,
    teamsRoutePattern,
    teamsRoutes,
} from '@core/routing/routes';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { AppComponent } from '../components/App.component';
import { signUpRedirectKey } from '../components/pages/SignUp.component';
import { exactMatch, includePrefix } from './match';
import {
    redirectToSprintTabFallback,
    redirectToTeamsFallback,
} from './redirect';

const publicRoutesInterceptor: RouteInterceptor = async (
    router: Router,
    routeUpdate: RouteUpdate,
): Promise<RouteInterceptorResult> => {
    if (includePrefix(publicRoutes, routeUpdate.routePattern)) {
        return {
            stopPipeline: true,
        };
    }

    return {};
};

const privateRoutesInterceptor = (
    identityClient: IdentityClient,
): RouteInterceptor => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        const isSignedIn = await identityClient.isSignedIn();
        if (!isSignedIn) {
            identityClient.trySignIn();
            return {
                isRedirected: true,
            };
        }

        return {};
    };
};

const userSignUpInterceptor = (
    stateSyncer: StateSyncer,
    localStore: LocalStore,
): RouteInterceptor => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        await stateSyncer.ensureConnected();

        let appState = localStore.getState();
        if (!appState.fetchedMeData) {
            await stateSyncer.pullCurrentUserWithTeams();
            appState = localStore.getState();
            appState.fetchedMeData = true;
            localStore.updateState(appState);

            if (!appState.currUserId) {
                const currUrl = window.location.href;
                localStorage.setItem(signUpRedirectKey, currUrl);
                router.navigateTo(signUpRoutePattern, {
                    notifyRouteChange: true,
                });
                return {
                    isRedirected: true,
                };
            }
        }

        return {};
    };
};

const appRoutesInterceptor = (localStore: LocalStore): RouteInterceptor => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        if (!includePrefix(appRoutes, routeUpdate.routePattern)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        if (!routeUpdate.routePattern.startsWith(teamsRoutePattern)) {
            return {
                stopPipeline: true,
            };
        }

        return {};
    };
};

const teamsRoutesInterceptor = (
    localStore: LocalStore,
    stateSyncer: StateSyncer,
    appRef: RefObject<AppComponent>,
): RouteInterceptor => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        if (!routeUpdate.routePattern.startsWith(teamsRoutePattern)) {
            return {};
        }

        if (!includePrefix(teamsRoutes, routeUpdate.routePattern)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        const teamId = parseInt(getTeamId(routeUpdate.params)!);
        if (isNaN(teamId)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        const appState = localStore.getState();
        if (!appState.fetchedTeamData || teamId !== appState.currTeamId) {
            await initTeam(stateSyncer, localStore, appRef);
        }

        if (!stateSyncer.trySetCurrentTeam(teamId)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        if (routeUpdate.routePattern.startsWith(taskRoutePattern)) {
            const taskId = parseInt(getTaskId(routeUpdate.params)!);
            if (isNaN(taskId)) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }

            appRef.current?.onViewTaskDetail(taskId);
            return {};
        }

        return {};
    };
};

const sprintsRouteInterceptor = (
    localStore: LocalStore,
    stateSyncer: StateSyncer,
) => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        if (!routeUpdate.routePattern.startsWith(sprintsRoutePattern)) {
            return {};
        }

        const teamId = parseInt(getTeamId(routeUpdate.params)!);
        const appState = localStore.getState();
        if (exactMatch(routeUpdate, sprintsRoutePattern)) {
            if (!appState.currSprintId) {
                appState.sprintTabReady = true;
                localStore.updateState(appState);
                return {};
            }

            return redirectToSprintTabFallback(router, teamId, appState);
        }

        if (!routeUpdate.routePattern.startsWith(sprintTabRoutePattern)) {
            return redirectToSprintTabFallback(router, teamId, appState);
        }

        const newSprintId = parseInt(getSprintId(routeUpdate.params)!);
        if (isNaN(newSprintId)) {
            return redirectToSprintTabFallback(router, teamId, appState);
        }

        if (!stateSyncer.trySetCurrentSprint(newSprintId)) {
            return redirectToSprintTabFallback(router, teamId, appState);
        }

        const tabId = getTabId(routeUpdate.params);
        if (!tabId || sprintTabIds.indexOf(tabId) < 0) {
            router.navigateTo(
                sprintTabPath(teamId, newSprintId, defaultSprintTabId),
                {
                    notifyRouteChange: true,
                },
            );
            return {
                isRedirected: true,
            };
        }

        appState.sprintTabReady = true;
        appState.activeSprintTabIndex = sprintTabIds.indexOf(tabId);
        localStore.updateState(appState);
        return {};
    };
};

export function addRouteInterceptors(
    deps: Deps,
    appRef: RefObject<AppComponent>,
) {
    deps.router.addRouteInterceptor(publicRoutesInterceptor);
    deps.router.addRouteInterceptor(
        privateRoutesInterceptor(deps.identityClient),
    );
    deps.router.addRouteInterceptor(
        userSignUpInterceptor(deps.stateSyncer, deps.localStore),
    );
    deps.router.addRouteInterceptor(appRoutesInterceptor(deps.localStore));
    deps.router.addRouteInterceptor(
        teamsRoutesInterceptor(deps.localStore, deps.stateSyncer, appRef),
    );
    deps.router.addRouteInterceptor(
        sprintsRouteInterceptor(deps.localStore, deps.stateSyncer),
    );
}

async function initTeam(
    stateSyncer: StateSyncer,
    localStore: LocalStore,
    appRef: RefObject<AppComponent>,
): Promise<void> {
    await stateSyncer.pullCurrentTeam();
    const appState = localStore.getState();
    appState.fetchedTeamData = true;
    localStore.updateState(appState);

    await stateSyncer.notifyInitialStateReceived();
    (async () => {
        appRef.current?.onTeamInit();
    })();
}
