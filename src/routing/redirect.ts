import { RouteInterceptorResult, Router } from '@lib/router/router';
import {
    sprintsPath,
    sprintTabPath,
    teamsRoutePattern
} from '@core/config/routing';
import { defaultSprintTabId } from '@core/config/sprints';
import { LocalStore } from '@core/storage/syncer/localStore';
export function redirectToSprintTabFallback(router: Router, teamId: number, currSprintId?: number): RouteInterceptorResult {
    if (currSprintId) {
        router.navigateTo(sprintTabPath(teamId, currSprintId, defaultSprintTabId), {
            notifyRouteChange: true
        });
    } else {
        router.navigateTo(sprintsPath(teamId), {
            notifyRouteChange: true
        });
    }

    return {
        isRedirected: true
    };
}

export function redirectToTeamsFallback(router: Router, localStore: LocalStore) {
    let appState = localStore.getState();
    const currTeamId = appState.currTeamId;
    if (currTeamId) {
        console.log(`redirectToTeamsFallback:${sprintsPath(currTeamId)}`);
        router.navigateTo(sprintsPath(currTeamId), {
            notifyRouteChange: true
        });
    } else {
        console.log(`redirectToTeamsFallback:${teamsRoutePattern}`);
        router.navigateTo(teamsRoutePattern, {
            notifyRouteChange: true
        });
    }
}