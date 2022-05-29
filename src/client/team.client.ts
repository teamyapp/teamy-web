import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteTeam } from '@core/client/entity/remoteTeam';
import { RemoteUser } from '@core/client/entity/remoteUser';

export interface CreateTeamInput {
    name: string;
}

export interface UpdateTeamInput {
    name: string;
    iconUrl?: string;
    ownerUserId: number;
}

export class TeamClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public createTeam(input: CreateTeamInput): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createTeam($input: CreateTeamInput!) {
                        createTeam(team: $input) {
                            id
                        }
                    }
                `,
                variables: {
                    input,
                },
            })
            .then((payload: any) => payload?.createTeam);
    }

    public updateTeam(
        teamId: number,
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

    public getTeamMembers(teamId: number): Promise<RemoteUser[]> {
        // TODO: implement me
        return Promise.resolve<any>({});
    }

    public addMemberToTeam(
        teamId: number,
        memberUserId: number,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation addMemberToTeam($teamId: ID!, $memberId: ID!) {
                        addMemberToTeam(teamId: $teamId, memberId: $memberId) {
                            id
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
        teamId: number,
        memberUserId: number,
    ): Promise<RemoteTeam> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation removeMemberFromTeam(
                        $teamId: ID!
                        $memberId: ID!
                    ) {
                        removeMemberFromTeam(
                            teamId: $teamId
                            memberId: $memberId
                        ) {
                            id
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
