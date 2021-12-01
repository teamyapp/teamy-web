import { User } from '../entity/User';
import { GraphQLClient } from '../network/GraphQL.client';
import Team from '../entity/Team';

interface ActiveTeamQueryPayload {
    activeTeam: Team;
}

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
  activeTeam {
    members {
      id
      firstName
      lastName
      profileUrl
    }
  }
}
`,
            )
            .then((payload: ActiveTeamQueryPayload) => {
                return payload.activeTeam?.members || [];
            });
    }
}
