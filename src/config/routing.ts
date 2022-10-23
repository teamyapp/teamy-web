import { Params } from '@lib/router/router';

export const absoluteRootPath = `${window.location.protocol}//${window.location.host}`;

const teamIdParam = 'teamId';
const sprintIdParam = 'sprintId';
const tabIdParam = 'tabId';
const taskIdParam = 'taskId';
const invitationIdParam = 'id';
const invitationCodeParam = 'code';

export const getTeamId = (params?: Params) => params?.pathParams[teamIdParam];
export const getSprintId = (params?: Params) =>
    params?.pathParams[sprintIdParam];
export const getTabId = (params?: Params) => params?.pathParams[tabIdParam];
export const getTaskId = (params?: Params) => params?.pathParams[taskIdParam];
export const getInvitationId = (params?: Params) =>
    params?.queryParams[invitationIdParam];
export const getInvitationCode = (params?: Params) =>
    params?.queryParams[invitationCodeParam];

export const rootRoutePattern = '/';
export const debugRoutePattern = `${rootRoutePattern}debug`;
export const teamRoutePattern = `${rootRoutePattern}teams/{${teamIdParam}}`;
export const taskRoutePattern = `${teamRoutePattern}/tasks/{${taskIdParam}}`;
export const invitationRoutePattern = `${rootRoutePattern}invitation`;
export const sprintsRoutePattern = `${teamRoutePattern}/sprints`;
export const sprintRoutePattern = `${sprintsRoutePattern}/{${sprintIdParam}}`;
export const sprintTabRoutePattern = `${sprintRoutePattern}/{${tabIdParam}}`;
export const insightsRoutePattern = `${teamRoutePattern}/insights`;
export const cloudRoutePattern = `${rootRoutePattern}cloud`;
export const signUpRoutePattern = `${rootRoutePattern}sign-up`;
export const signInRoutePattern = `${cloudRoutePattern}/identity/sign-in`;
export const signInFinishRoutePattern = `${cloudRoutePattern}/identity/sign-in-finish`;

export const teamPath = (teamId: number) => `/teams/${teamId}`;
export const sprintsPath = (teamId: number) => `/teams/${teamId}/sprints`;
export const sprintTabPath = (
    teamId: number,
    sprintId: number,
    tabId: string,
) => `${teamPath(teamId)}/sprints/${sprintId}/${tabId}`;
export const taskPath = (teamId: number, taskId: number) =>
    `${teamPath(teamId)}/tasks/${taskId}`;

export const signInFinishPath = `${absoluteRootPath}${signInFinishRoutePattern}`;

export const invitationLink = (invitationId: number, code: string) =>
    `${absoluteRootPath}${invitationRoutePattern}?id=${invitationId}&code=${code}`;

export const absoluteUri = (relativePath: string) =>
    `${absoluteRootPath}${relativePath}`;
