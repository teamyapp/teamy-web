import Team from '../entity/Team';
import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';
import { QueryPayload } from './QueryPayload';

export class TeamService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTeamMembers(): Promise<User[]> {
        return this.graphQLClient
            .query(
                `
query {
  me {
    activeTeam {
      members {
        id
        firstName
        lastName
        profileUrl
      }
    }
  }
}
`,
            )
            .then((payload: QueryPayload) => {
                return payload.me.activeTeam?.members || [];
            });
    }

    public fetchTeams(): Promise<Team[]> {
        return this.graphQLClient
            .query(
                `
query {
  me {
    teams {
      id
      name
      logoUrl
    }
  }
}
`,
            )
            .then((payload: QueryPayload) => {
                return payload.me.teams;
            });
    }
}
