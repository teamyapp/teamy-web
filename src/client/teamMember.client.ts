import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteUpdateTeamMemberInput } from '@core/client/entity/input';
import { RemoteTeamMember } from '@core/client/entity/remoteTeamMember';

export class TeamMemberClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getTeamMembers(teamId: string): Promise<RemoteTeamMember[]> {
        return this.graphQLClient
            .query({
                query: `
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
                                weeklyBandwidth
                                createdAt
                                updatedAt
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

    public updateTeamMember(
        teamId: string,
        input: RemoteUpdateTeamMemberInput,
    ): Promise<RemoteTeamMember> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation updateTeamMember(
                        $teamId: ID!
                        $input: UpdateTeamMemberInput!
                    ) {
                        updateTeamMember(teamId: $teamId, input: $input) {
                            team {
                                id
                            }
                            user {
                                id
                            }
                            weeklyBandwidth
                        }
                    }
                `,
                variables: {
                    teamId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateTeamMember);
    }

    public addMemberToTeam(
        teamId: string,
        memberUserId: string,
    ): Promise<RemoteTeamMember> {
        return this.graphQLClient
            .mutate({
                mutation: `
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
                mutation: `
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

    public moveUpTeamMemberGroup(id: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation moveUpTeamMemberGroup($id: ID!) {
                        moveUpTeamMemberGroup(id: $id) {
                            id
                            orderIndex
                        }
                    }
                `,
                variables: {
                    id,
                },
            })
            .then(() => {});
    }

    public moveDownTeamMemberGroup(id: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation moveDownTeamMemberGroup($id: ID!) {
                        moveDownTeamMemberGroup(id: $id) {
                            id
                            orderIndex
                        }
                    }
                `,
                variables: {
                    id,
                },
            })
            .then(() => {});
    }
}
