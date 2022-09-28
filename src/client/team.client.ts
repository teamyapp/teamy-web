import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteTaskFilter } from '@core/client/entity/filter';
import { CreateTeamInput, UpdateTeamInput } from '@core/client/entity/input';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';

export class TeamClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getTeamWithSprintPreviews(teamId: string): Promise<RemoteTeam> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getTeam($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            id
                            iconUrl
                            taskActivities {
                                taskId
                                dragTaskActivity {
                                    isDragging
                                    client {
                                        id
                                        user {
                                            id
                                        }
                                    }
                                }
                            }
                            sprints {
                                id
                                startAt
                                endAt
                                owningTeam {
                                    id
                                }
                            }
                        }
                    }
                `,
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
                query: gql`
                    query getTeam($teamId: ID!, $taskFilter: TaskFilter) {
                        teams(filter: { teamId: $teamId }) {
                            id
                            tasks(filter: $taskFilter) {
                                id
                                goal
                                dueAt
                                status
                                isPlanned
                                effort
                                owner {
                                    id
                                    firstName
                                    lastName
                                    profileUrl
                                }
                                owningTeam {
                                    id
                                }
                                awaitForTasks {
                                    id
                                    status
                                    isPlanned
                                    owningTeam {
                                        id
                                    }
                                }
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    taskFilter,
                },
            })
            .then((payload: any) => payload?.teams[0]);
    }

    public createTeam(team: CreateTeamInput): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
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
        input: UpdateTeamInput,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation updateTeam(
                        $teamId: ID!
                        $input: UpdateTeamInput!
                    ) {
                        updateTeam(teamId: $teamId, input: $input) {
                            id
                            name
                            iconUrl
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

    public getTeamMembers(teamId: string): Promise<RemoteTeamMember[]> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getTeamMembers($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            members {
                                user {
                                    id
                                    lastName
                                    firstName
                                    profileUrl
                                    createdAt
                                }
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.teams[0]?.members);
    }

    public addMemberToTeam(
        teamId: string,
        memberUserId: string,
    ): Promise<RemoteTeamMember> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation addMemberToTeam($teamId: ID!, $memberUserId: ID!) {
                        addMemberToTeam(
                            teamId: $teamId
                            memberUserId: $memberUserId
                        ) {
                            team {
                                id
                            }
                            user {
                                id
                                lastName
                                firstName
                                profileUrl
                                createdAt
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    memberUserId,
                },
            })
            .then((payload: any) => payload?.addMemberToTeam);
    }

    public removeMemberFromTeam(
        teamId: string,
        memberUserId: string,
    ): Promise<RemoteTeamMember> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation removeMemberFromTeam(
                        $teamId: ID!
                        $memberUserId: ID!
                    ) {
                        removeMemberFromTeam(
                            teamId: $teamId
                            memberUserId: $memberUserId
                        ) {
                            team {
                                id
                            }
                            user {
                                id
                                lastName
                                firstName
                                profileUrl
                                createdAt
                            }
                        }
                    }
                `,
                variables: {
                    teamId,
                    memberUserId,
                },
            })
            .then((payload: any) => payload?.removeMemberFromTeam);
    }

    public createTeamIconUploadSession(teamId: string): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
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
                mutation: gql`
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
