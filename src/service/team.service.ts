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

    // get the team members of a team
    public async fetchTeamMembers(teamId: number): Promise<User[]> {
        let data = await this.graphQLClient
            .query({ query: queries.teamMembers })
        for(let team of data.me.teams) {
            if(team.id == teamId) {
                return team.members
            }
        }
        return []
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

    public updateActiveTeamId(teamId: number): Promise<void> {
        return this.graphQLClient.mutate({
            mutation: mutations.updateActiveTeam,
            variables: {
                teamId,
            },
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
