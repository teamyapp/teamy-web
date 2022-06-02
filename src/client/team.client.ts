import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { CreateTeamInput, UpdateTeamInput } from '@core/client/entity/input';
import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteUser } from '@core/client/entity/remoteUser';

export class TeamClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
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

    public getTeamMembers(teamId: string): Promise<RemoteUser[]> {
        return this.graphQLClient
            .query({
                query: gql`
                    query getTeamMembers($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            members {
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
                },
            })
            .then((payload: any) => payload?.teams[0]?.members);
    }

    public addMemberToTeam(
        teamId: string,
        memberUserId: string,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation addMemberToTeam($teamId: ID!, $memberUserId: ID!) {
                        addMemberToTeam(
                            teamId: $teamId
                            memberUserId: $memberUserId
                        ) {
                            id
                            firstName
                            lastName
                            profileUrl
                            teams {
                                id
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
    ): Promise<RemoteUser> {
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
                            id
                            firstName
                            lastName
                            profileUrl
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
}
