import { Params } from '@lib/router/router';

const teamIdParam = 'teamId';
const tabIdParam = 'tabId';
const taskIdParam = 'taskId';

export const getTeamId = (params: Params) => params.pathParams[teamIdParam];
export const getTabId = (params: Params) => params.pathParams[tabIdParam];
export const getTaskId = (params: Params) => params.pathParams[taskIdParam];

export const rootRoutePattern = '/';
export const debugRoutePattern = `${rootRoutePattern}debug`;
export const teamRoutePattern = `${rootRoutePattern}teams/{${teamIdParam}}`;
export const executionTabRoutePattern = `${teamRoutePattern}/execution/{${tabIdParam}}`;
export const executionTaskRoutePattern = `${executionTabRoutePattern}/tasks/{${taskIdParam}}`;

export const teamPath = (teamId: string) => `/teams/${teamId}`;
export const executionTabPath = (teamId: string, tabId: string) =>
    `/teams/${teamId}/execution/${tabId}`;
export const executionTaskPath = (
    teamId: string,
    tabId: string,
    taskId: string,
) => `/teams/${teamId}/execution/${tabId}/tasks/${taskId}`;
