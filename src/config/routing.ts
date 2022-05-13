import { Params } from '@lib/router/router';

const absoluteRootPath = `${window.location.protocol}//${window.location.host}`;

const teamIdParam = 'teamId';
const tabIdParam = 'tabId';
const taskIdParam = 'taskId';
const invitationCodeParam = 'code';

export const getTeamId = (params?: Params) => params?.pathParams[teamIdParam];
export const getTabId = (params?: Params) => params?.pathParams[tabIdParam];
export const getTaskId = (params?: Params) => params?.pathParams[taskIdParam];
export const getInvitationCode = (params?: Params) =>
    params?.queryParams[invitationCodeParam];

export const rootRoutePattern = '/';
export const debugRoutePattern = `${rootRoutePattern}debug`;
export const teamRoutePattern = `${rootRoutePattern}teams/{${teamIdParam}}`;
export const invitationRoutePattern = `${rootRoutePattern}invitation`;
export const executionTabRoutePattern = `${teamRoutePattern}/execution/{${tabIdParam}}`;
export const executionTaskRoutePattern = `${executionTabRoutePattern}/tasks/{${taskIdParam}}`;
export const cloudRoutePattern = `${rootRoutePattern}cloud`;

export const rootPath = rootRoutePattern;
export const cloudPath = `${rootPath}cloud`;
export const signInPath = `${cloudPath}/identity/sign-in`;
export const signInFinishPath = `${cloudPath}/identity/sign-in/finish`;
// export const signInFinishPath = `${cloudPath}/identity/sign-in/finish`;
// export const signUpPath = signUpRoutePattern;

export const teamPath = (teamId: string) => `/teams/${teamId}`;
export const executionTabPath = (teamId: string, tabId: string) =>
    `${teamPath(teamId)}/execution/${tabId}`;
export const executionTaskPath = (
    teamId: string,
    tabId: string,
    taskId: string,
) => `${executionTabPath(teamId, tabId)}/tasks/${taskId}`;

export const signInFinishLink = `${absoluteRootPath}${signInFinishPath}`;

export const invitationLink = (code: string) =>
    `${absoluteRootPath}${invitationRoutePattern}?code=${code}`;
