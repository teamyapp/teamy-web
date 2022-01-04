import { GraphQLClient } from '@lib/network/GraphQL.client';

import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import * as mutations from './mutations';
import * as queries from './queries';

export class TeamService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTeamMembers(): Promise<User[]> {
        return this.graphQLClient
            .query({ query: queries.teamMembers })
            .then((payload: any) => {
                return payload?.me?.activeTeam?.members || [];
            });
    }

    public fetchActiveTeamId(): Promise<number> {
        return this.graphQLClient
            .query({ query: queries.activeTeamId })
            .then((payload: any) => {
                return payload?.me?.activeTeam?.id || -1;
            });
    }

    public fetchTeam(teamId: number): Promise<Team> {
        return this.graphQLClient
            .query({
                query: queries.teamsWithMembers,
                variables: { ids: [teamId] },
            })
            .then((payload: any) => {
                return payload?.me?.teams || [];
            })
            .then((teams: Team[]) => {
                return teams[0];
            });
    }

    public fetchTeams(): Promise<Team[]> {
        return this.graphQLClient
            .query({ query: queries.teams })
            .then((payload: any) => {
                return payload?.me?.teams || [];
            });
    }

    public addTeamMember(teamId: number, newMemberId: number): Promise<void> {
        return this.graphQLClient.mutate({
            mutation: mutations.addTeamMember,
            variables: {
                teamId,
                newMemberId: `${newMemberId}`,
            },
        });
    }

    public updateTeam(team: Team): Promise<void> {
        return this.graphQLClient.mutate({
            mutation: mutations.updateTeam,
            variables: {
                teamId: team.id,
                teamInput: {
                    name: team.name,
                },
            },
        });
    }
}
