import { RefObject } from 'react';

import { IdentityClient } from '@lib/identity/Identity.client';
import {
    RouteInterceptor,
    RouteInterceptorResult,
    RouteUpdate,
    Router,
} from '@lib/router/router';

import { defaultSprintTabId, sprintTabIds } from '@core/config/sprints';
import { FeatureToggle } from '@core/config/toggle';
import { Deps } from '@core/dep/deps';
import {
    appRoutes,
    getSprintId,
    getTabId,
    getTaskId,
    getTeamId,
    helpCenterRoutePattern,
    insightsRoutePattern,
    knowledgeRoutePattern,
    marketplaceRoutePattern,
    marketplaceRoutes,
    planningRoutePattern,
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
    redirectToMarketplaceFallback,
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
    featureToggle: FeatureToggle,
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

        if (routeUpdate.routePattern.startsWith(insightsRoutePattern)) {
            if (!featureToggle.enableInsights) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }
        } else if (routeUpdate.routePattern.startsWith(planningRoutePattern)) {
            if (!featureToggle.enablePlanningDoc) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }
        } else if (routeUpdate.routePattern.startsWith(knowledgeRoutePattern)) {
            if (!featureToggle.enableKnowledgeBase) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }
        } else if (routeUpdate.routePattern.startsWith(helpCenterRoutePattern)) {
            if (!featureToggle.enableHelpCenter) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }
        } else if (
            routeUpdate.routePattern.startsWith(marketplaceRoutePattern)) {
            if (!featureToggle.enableMarketplace) {
                redirectToTeamsFallback(router, localStore);
                return {
                    isRedirected: true,
                };
            }
        }

        const appState = localStore.getState();
        if (!stateSyncer.trySetCurrentTeam(teamId)) {
            redirectToTeamsFallback(router, localStore);
            return {
                isRedirected: true,
            };
        }

        if (!appState.fetchedTeamData || teamId !== appState.currTeamId) {
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

const marketplaceRoutesInterceptor = (
    localStore: LocalStore,
): RouteInterceptor => {
    return async (
        router: Router,
        routeUpdate: RouteUpdate,
    ): Promise<RouteInterceptorResult> => {
        if (!routeUpdate.routePattern.startsWith(marketplaceRoutePattern)) {
            return {};
        }

        if (!includePrefix(marketplaceRoutes, routeUpdate.routePattern)) {
            redirectToMarketplaceFallback(
                router,
                localStore.getState().currTeamId!,
            );
            return {
                isRedirected: true,
            };
        }

        // TODO: set filter
        return {};
    };
};

export function addRouteInterceptors(
    deps: Deps,
    appRef: RefObject<AppComponent>,
) {
    let interceptors: RouteInterceptor[] = [
        publicRoutesInterceptor,
        privateRoutesInterceptor(deps.identityClient),
        userSignUpInterceptor(deps.stateSyncer, deps.localStore),
        appRoutesInterceptor(deps.localStore),
        teamsRoutesInterceptor(
            deps.localStore,
            deps.stateSyncer,
            deps.featureToggle,
            appRef,
        ),
        sprintsRouteInterceptor(deps.localStore, deps.stateSyncer),
        marketplaceRoutesInterceptor(deps.localStore),
    ];
    interceptors.forEach((interceptor) => {
        deps.router.addRouteInterceptor(interceptor);
    });
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
