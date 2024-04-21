import { Params } from '@lib/router/router';

export const absoluteRootPath = `${window.location.protocol}//${window.location.host}`;

const teamIdParam = 'teamId';
const sprintIdParam = 'sprintId';
const tabIdParam = 'tabId';
const taskIdParam = 'taskId';
const invitationIdParam = 'id';
const invitationCodeParam = 'code';
const tagsParam = 'tags';
const projectIdParam = 'projectId';
const phaseIdParam = 'phaseId';
const storyIdParam = 'storyId';

export const getTeamId = (params?: Params) => params?.pathParams[teamIdParam];
export const getSprintId = (params?: Params) =>
    params?.pathParams[sprintIdParam];
export const getTabId = (params?: Params) => params?.pathParams[tabIdParam];
export const getTaskId = (params?: Params) => params?.pathParams[taskIdParam];
export const getInvitationId = (params?: Params) =>
    params?.queryParams[invitationIdParam];
export const getInvitationCode = (params?: Params) =>
    params?.queryParams[invitationCodeParam];
export const getTags = (params?: Params): string[] => {
    const tagsString = params?.queryParams[tagsParam];
    return tagsString ? tagsString.split(',') : [];
};
export const getProjectId = (params?: Params) =>
    params?.pathParams[projectIdParam];
export const getPhaseId = (params?: Params) => params?.pathParams[phaseIdParam];
export const getStoryId = (params?: Params) => params?.pathParams[storyIdParam];

export const rootRoutePattern = '/';
export const teamsRoutePattern = `${rootRoutePattern}teams`;
export const debugRoutePattern = `${rootRoutePattern}debug`;
export const teamRoutePattern = `${teamsRoutePattern}/{${teamIdParam}}`;
export const taskRoutePattern = `${teamRoutePattern}/tasks/{${taskIdParam}}`;
export const invitationRoutePattern = `${rootRoutePattern}invitation`;
export const sprintsRoutePattern = `${teamRoutePattern}/sprints`;
export const sprintRoutePattern = `${sprintsRoutePattern}/{${sprintIdParam}}`;
export const sprintTabRoutePattern = `${sprintRoutePattern}/{${tabIdParam}}`;
export const insightsRoutePattern = `${teamRoutePattern}/insights`;
export const planningRoutePattern = `${teamRoutePattern}/planning`;

export const projectsRoutePattern = `${planningRoutePattern}/projects`;
export const projectRoutePattern = `${projectsRoutePattern}/{${projectIdParam}}`;
export const phaseRoutePattern = `${projectRoutePattern}/phases/{${phaseIdParam}}`;
export const phaseStoryRoutePattern = `${phaseRoutePattern}/stories/{${storyIdParam}}`;
export const projectStoryRoutePattern = `${projectRoutePattern}/stories/{${storyIdParam}}`;

export const knowledgeRoutePattern = `${teamRoutePattern}/knowledge`;
export const marketplaceRoutePattern = `${teamRoutePattern}/marketplace`;

export const marketplaceManagedRoutePattern = `${marketplaceRoutePattern}/managed`;
export const marketplaceInstalledRoutePattern = `${marketplaceRoutePattern}/installed`;
export const marketplaceDiscoverRoutePattern = `${marketplaceRoutePattern}/discover`;
export const marketplaceFilterRoutePattern = `${marketplaceRoutePattern}/filter`;

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
export const insightsPath = (teamId: number) => `/teams/${teamId}/insights`;
export const planningPath = (teamId: number) => `/teams/${teamId}/planning`;
export const projectsPath = (teamId: number) =>
    `/teams/${teamId}/planning/projects`;
export const projectPath = (teamId: number, projectId: number) =>
    `/teams/${teamId}/planning/projects/${projectId}`;
export const phasePath = (teamId: number, projectId: number, phaseId: number) =>
    `/teams/${teamId}/planning/projects/${projectId}/phases/${phaseId}`;
export const phaseStoryPath = (
    teamId: number,
    projectId: number,
    phaseId: number,
    storyId: number,
) =>
    `/teams/${teamId}/planning/projects/${projectId}/phases/${phaseId}/stories/${storyId}`;
export const projectStoryPath = (
    teamId: number,
    projectId: number,
    storyId: number,
) => `/teams/${teamId}/planning/projects/${projectId}/stories/${storyId}`;
export const knowledgePath = (teamId: number) => `/teams/${teamId}/knowledge`;
export const marketplacePath = (teamId: number) =>
    `${teamPath(teamId)}/marketplace`;

export const marketplaceManagedPath = (teamId: number) =>
    `${marketplacePath(teamId)}/managed`;
export const marketplaceInstalledPath = (teamId: number) =>
    `${marketplacePath(teamId)}/installed`;
export const marketplaceDiscoverPath = (teamId: number) =>
    `${marketplacePath(teamId)}/discover`;
export const marketplaceFilterPath = (teamId: number, tags: string[]) =>
    `${marketplacePath(teamId)}/filter?tags=${tags.join(',')}`;

export const signInFinishPath = `${absoluteRootPath}${signInFinishRoutePattern}`;

export const invitationLink = (invitationId: number, code: string) =>
    `${absoluteRootPath}${invitationRoutePattern}?id=${invitationId}&code=${code}`;

export const absoluteUri = (relativePath: string) =>
    `${absoluteRootPath}${relativePath}`;

export const publicRoutes = [
    signInRoutePattern,
    signInFinishRoutePattern,
    debugRoutePattern,
];

export const appRoutes = [
    signUpRoutePattern,
    teamsRoutePattern,
    invitationRoutePattern,
];

export const teamsRoutes = [
    sprintsRoutePattern,
    insightsRoutePattern,
    planningRoutePattern,
    knowledgeRoutePattern,
    invitationRoutePattern,
    marketplaceRoutePattern,
    taskRoutePattern,
];

export const planningRoutes = [
    projectsRoutePattern,
    projectRoutePattern,
    phaseRoutePattern,
    phaseStoryRoutePattern,
    projectStoryRoutePattern,
];

export const marketplaceRoutes = [
    marketplaceManagedRoutePattern,
    marketplaceInstalledRoutePattern,
    marketplaceDiscoverRoutePattern,
    marketplaceFilterRoutePattern,
];

export const sprintsRoutes = [sprintTabRoutePattern];
