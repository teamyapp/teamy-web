import Team from '../entity/Team';
import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';

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
    id
    activeTeam {
      id
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
            .then((payload: any) => {
                return payload?.me?.activeTeam?.members || [];
            });
    }

    public fetchActiveTeamId(): Promise<number> {
        return this.graphQLClient
            .query(
                `
query {
  me {
    id
    activeTeam {
      id
    }
  }
}
`,
            )
            .then((payload: any) => {
                return payload?.me?.activeTeam?.id || -1;
            });
    }

    public fetchTeams(): Promise<Team[]> {
        return this.graphQLClient
            .query(
                `
query {
  me {
    id
    teams {
      id
      name
      iconUrl
    }
  }
}
`,
            )
            .then((payload: any) => {
                return payload?.me?.teams || [];
            });
    }

    public updateActiveTeamId(teamId: number): Promise<boolean> {
        return this.graphQLClient
            .query(
                `
mutation updateActiveTeam($teamId: ID!) {
  updateActiveTeam(teamId: $teamId) {
    id
  }
}
`,
                {
                    teamId,
                },
            )
            .then((payload: any) => {
                return payload?.updateActiveTeam;
            });
    }
}
