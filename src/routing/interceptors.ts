import {
    RouteInterceptor,
    RouteInterceptorResult,
    Router,
    RouteUpdate
} from '@lib/router/router';
import {
    getSprintId,
    getTabId,
    getTaskId,
    getTeamId,
    publicRoutes,
    signUpRoutePattern,
    sprintsPath,
    sprintsRoutes,
    sprintTabPath,
    sprintTabRoutePattern,
    taskRoutePattern,
    teamsRoutePattern,
    teamsRoutes,
    appRoutes,
    sprintsRoutePattern,
    teamRoutePattern, sprintRoutePattern
} from '@core/config/routing';
import { IdentityClient } from '@lib/identity/Identity.client';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';
import { signUpRedirectKey } from '../components/pages/SignUp.component';
import { RefObject } from 'react';
import { AppComponent } from '../components/App.component';
import { defaultSprintTabId, sprintTabIds } from '@core/config/sprints';
import { Deps } from '@core/dep/deps';
import {
    redirectToSprintTabFallback,
    redirectToTeamsFallback
} from './redirect';

const publicRoutesInterceptor: RouteInterceptor =
    async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
        if (includePrefix(publicRoutes, routeUpdate.routePattern)) {
            return {
                stopPipeline: true,
            };
        }

        return {};
    };

const privateRoutesInterceptor = (identityClient: IdentityClient): RouteInterceptor => {
    return async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
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

const userSignUpInterceptor = (stateSyncer: StateSyncer, localStore: LocalStore): RouteInterceptor => {
    return async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
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
                    notifyRouteChange: true
                });
                return {
                    isRedirected: true
                };
            }
        }

        return {};
    };
};

const appRoutesInterceptor = (localStore: LocalStore): RouteInterceptor => {
    return async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
        if (!includePrefix(appRoutes, routeUpdate.routePattern)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        if (!routeUpdate.routePattern.startsWith(teamsRoutePattern)) {
            return {
                stopPipeline: true
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
    return async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
        if (!routeUpdate.routePattern.startsWith(teamsRoutePattern)) {
            return {}
        }

        if (!includePrefix(teamsRoutes, routeUpdate.routePattern)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true
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
        if (teamId !== appState.currTeamId) {
            if (!stateSyncer.trySetCurrentTeam(teamId)) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }

            await initTeam(stateSyncer, localStore, appRef);
        } else if (!appState.fetchedTeamData) {
            await initTeam(stateSyncer, localStore, appRef);
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

const sprintsRouteInterceptor = (localStore: LocalStore, stateSyncer: StateSyncer) => {
    return async (router: Router, routeUpdate: RouteUpdate): Promise<RouteInterceptorResult> => {
        if (!routeUpdate.routePattern.startsWith(sprintsRoutePattern)) {
            return {}
        }

        const teamId = parseInt(getTeamId(routeUpdate.params)!);
        const appState = localStore.getState();
        if (exactMatch(routeUpdate,sprintsRoutePattern)) {
            return redirectToSprintTabFallback(router, teamId, appState.currSprintId);
        }

        if (!routeUpdate.routePattern.startsWith(sprintTabRoutePattern)) {
            return redirectToSprintTabFallback(router, teamId, appState.currSprintId);
        }

        const newSprintId = parseInt(getSprintId(routeUpdate.params)!);
        if (isNaN(newSprintId)) {
            return redirectToSprintTabFallback(router, teamId, appState.currSprintId);
        }

        if (!stateSyncer.trySetCurrentSprint(newSprintId)) {
            return redirectToSprintTabFallback(router, teamId, appState.currSprintId);
        }

        const tabId = getTabId(routeUpdate.params);
        if (!tabId || sprintTabIds.indexOf(tabId) < 0) {
            router.navigateTo(sprintTabPath(teamId, newSprintId, defaultSprintTabId), {
                notifyRouteChange: true
            });
            return {
                isRedirected: true
            };
        }


        appState.activeSprintTabIndex = sprintTabIds.indexOf(tabId);
        localStore.updateState(appState);
        return {};
    };
};

function exactMatch(routeUpdate: RouteUpdate, pattern: string): boolean {
    const suffixLength = routeUpdate.suffix?.length || 0;
    return routeUpdate.routePattern === pattern && suffixLength === 0;
}

function includePrefix(patterns: string[], input: string): boolean {
    for (const pattern of patterns) {
        if (input.startsWith(pattern)) {
            return true;
        }
    }

    return false;
}

export function addRouteInterceptors(deps: Deps, appRef: RefObject<AppComponent>) {
    deps.router.addRouteInterceptor(publicRoutesInterceptor);
    deps.router.addRouteInterceptor(privateRoutesInterceptor(deps.identityClient));
    deps.router.addRouteInterceptor(userSignUpInterceptor(deps.stateSyncer, deps.localStore));
    deps.router.addRouteInterceptor(appRoutesInterceptor(deps.localStore));
    deps.router.addRouteInterceptor(teamsRoutesInterceptor(deps.localStore, deps.stateSyncer, appRef));
    deps.router.addRouteInterceptor(sprintsRouteInterceptor(deps.localStore, deps.stateSyncer));
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
    (async () => {
        appRef.current?.onTeamInit();
    })();
}