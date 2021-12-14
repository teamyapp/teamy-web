import Team from '../entity/Team';
import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';
import { QueryActiveTeamId, QueryTeamMembers, QueryTeams } from './queries';
import * as mutations from './mutations';

export class TeamService {
  private readonly graphQLClient: GraphQLClient;

  constructor(graphQLClient: GraphQLClient) {
    this.graphQLClient = graphQLClient;
  }

  public fetchTeamMembers(): Promise<User[]> {
    return this.graphQLClient
      .query(
        { query: QueryTeamMembers },
      )
      .then((payload: any) => {
        return payload?.me?.activeTeam?.members || [];
      });
  }

  public fetchActiveTeamId(): Promise<number> {
    return this.graphQLClient
      .query(
        { query: QueryActiveTeamId },
      )
      .then((payload: any) => {
        return payload?.me?.activeTeam?.id || -1;
      });
  }

  public fetchTeams(): Promise<Team[]> {
    return this.graphQLClient
      .query(
        { query: QueryTeams },
      )
      .then((payload: any) => {
        return payload?.me?.teams || [];
      });
  }

  public updateActiveTeamId(teamId: number): Promise<boolean> {
    return this.graphQLClient
      .mutate({
        mutation: mutations.updateActiveTeam,
        variables: {
          teamId,
        },
      })
      .then((payload: any) => {
        return payload?.updateActiveTeam;
      });
  }
}
