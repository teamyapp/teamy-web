import { RouteInterceptorResult, Router } from '@lib/router/router';

import { defaultSprintTabId, sprintTabIds } from '@core/config/sprints';
import {
    sprintTabPath,
    sprintsPath,
    teamsRoutePattern,
} from '@core/routing/routes';
import { AppState } from '@core/storage/states/app.state';
import { LocalStore } from '@core/storage/syncer/localStore';

export function redirectToSprintTabFallback(
    router: Router,
    teamId: number,
    appState: AppState,
): RouteInterceptorResult {
    if (appState.currSprintId) {
        let tabId = defaultSprintTabId;
        if (appState.activeSprintTabIndex !== undefined) {
            tabId = sprintTabIds[appState.activeSprintTabIndex];
        }

        router.navigateTo(sprintTabPath(teamId, appState.currSprintId, tabId), {
            notifyRouteChange: true,
        });
    } else {
        router.navigateTo(sprintsPath(teamId), {
            notifyRouteChange: true,
        });
    }

    return {
        isRedirected: true,
    };
}

export function redirectToTeamsFallback(
    router: Router,
    localStore: LocalStore,
) {
    let appState = localStore.getState();
    const currTeamId = appState.currTeamId;
    if (currTeamId) {
        console.log(`redirectToTeamsFallback:${sprintsPath(currTeamId)}`);
        router.navigateTo(sprintsPath(currTeamId), {
            notifyRouteChange: true,
        });
    } else {
        console.log(`redirectToTeamsFallback:${teamsRoutePattern}`);
        router.navigateTo(teamsRoutePattern, {
            notifyRouteChange: true,
        });
    }
}
