import { Team } from '@core/entityv2/team';
import { User } from '@core/entityv2/user';
import {gql} from "@apollo/client";
import {GraphQLClient} from "@lib/network/GraphQL.client";

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

    public createTeam(input: CreateTeamInput): Promise<Team> {
        return this.graphQLClient.mutate({
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
        .then((payload: any) => payload?.createTeam)
    }

    public updateTeam(teamId: number, input: UpdateTeamInput): Promise<Team> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation updateTeam($teamId: ID!,$input: UpdateTeamInput!) {
                    updateTeam(teamId: $teamId, input : $input) {
                        id
                    }
                }
            `,
            variables: {
                teamId,
                input,
            },
        })
        .then((payload: any) => payload?.updateTeam)
    }

    public getTeamMembers(teamId: number): Promise<User[]> {
        // TODO: implement me
        return Promise.resolve<any>({});
    }

    public addMemberToTeam(teamId: number, memberUserId: number): Promise<Team> {
        return this.graphQLClient.mutate({
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
        .then((payload: any) => payload?.addMemberToTeam)
    }

    public removeMemberFromTeam(teamId: number, memberUserId: number): Promise<Team> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation removeMemberFromTeam($teamId: ID!, $memberId: ID!) {
                    removeMemberFromTeam(teamId: $teamId, memberId: $memberId) {
                        id
                    }
                }
            `,
            variables: {
                teamId,
                memberUserId,
            },
        })
        .then((payload: any) => payload?.removeMemberFromTeam)
    }
}
