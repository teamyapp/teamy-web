import Team from '../entity/Team';
import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';
import { MutationPayload, QueryPayload } from './QueryPayload';

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
                return payload?.me?.activeTeam?.members || [];
            });
    }

    public fetchActiveTeamId(): Promise<number> {
        return this.graphQLClient
            .query(
                `
query {
  me {
    activeTeam {
      id
    }
  }
}
`,
            )
            .then((payload: QueryPayload) => {
                return payload?.me?.activeTeam?.id || -1;
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
                return payload?.me?.teams || [];
            });
    }

    public updateActiveTeamId(teamId: number): Promise<boolean> {
        return this.graphQLClient
            .query(
                `
mutation updateActiveTeam($teamId: ID!) {
  updateActiveTeam(teamId: $teamId)
}
`,
                {
                    teamId,
                },
            )
            .then((payload: MutationPayload) => {
                return payload?.updateActiveTeam;
            });
    }
}
