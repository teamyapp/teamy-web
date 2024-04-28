import { print } from 'graphql';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteTaskFilter } from '@core/client/entity/filter';
import {
    RemoteCreateTeamInput,
    RemoteUpdateTeamInput,
} from '@core/client/entity/input';
import { RemoteTeam } from '@core/client/entity/remoteTeam';

import getTeamWithSprintPreviews from './graphql/query/getTeamWithSprintPreviews.graphql';
import getTeamWithTaskPreviews from './graphql/query/getTeamWithTaskPreviews.graphql';

export class TeamClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getTeamWithSprintPreviews(teamId: string): Promise<RemoteTeam> {
        return this.graphQLClient
            .query({
                query: print(getTeamWithSprintPreviews),
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.teams[0]);
    }

    public getTeamWithTaskPreviews(
        teamId: string,
        taskFilter?: RemoteTaskFilter,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .query({
                query: print(getTeamWithTaskPreviews),
                variables: {
                    teamId,
                    taskFilter,
                },
            })
            .then((payload: any) => payload?.teams[0]);
    }

    public createTeam(team: RemoteCreateTeamInput): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createTeam($input: CreateTeamInput!) {
                        createTeam(team: $input) {
                            id
                            name
                            iconUrl
                            owner {
                                id
                            }
                            members {
                                user {
                                    id
                                }
                            }
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    input: team,
                },
            })
            .then((payload: any) => payload?.createTeam);
    }

    public updateTeam(
        teamId: string,
        input: RemoteUpdateTeamInput,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateTeam(
                        $teamId: ID!
                        $input: UpdateTeamInput!
                    ) {
                        updateTeam(teamId: $teamId, input: $input) {
                            id
                            name
                            iconUrl
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateTeam);
    }

    public updateTeamActiveSprint(teamId: string, sprintId: string) {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateTeamActiveSprint(
                        $teamId: ID!
                        $sprintId: ID!
                    ) {
                        updateTeamActiveSprint(
                            teamId: $teamId
                            sprintId: $sprintId
                        ) {
                            id
                            name
                            iconUrl
                            activeSprint {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    sprintId,
                },
            })
            .then((payload: any) => payload?.updateTeamActiveSprint);
    }

    public deleteTeam(teamId: string): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteTeam($teamId: ID!) {
                        deleteTeam(teamId: $teamId) {
                            id
                        }
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.deleteTeam);
    }

    public createTeamIconUploadSession(teamId: string): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createTeamIconUploadSession($teamId: ID!) {
                        createTeamIconUploadSession(teamId: $teamId)
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.createTeamIconUploadSession);
    }

    public finishTeamIconUploadSession(
        teamId: string,
        fileUploadSessionId: string,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation finishTeamIconUploadSession(
                        $teamId: ID!
                        $fileUploadSessionId: ID!
                    ) {
                        finishTeamIconUploadSession(
                            teamId: $teamId
                            fileUploadSessionId: $fileUploadSessionId
                        ) {
                            id
                            iconUrl
                        }
                    }
                `,
                variables: {
                    teamId,
                    fileUploadSessionId,
                },
            })
            .then((payload: any) => payload?.finishTeamIconUploadSession);
    }
}
