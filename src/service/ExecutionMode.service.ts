import PersonalStatus from '../entity/PersonalStatus';
import TeamStatus from '../entity/TeamStatus';
import { GraphQLClient } from '../network/GraphQL.client';

export class ExecutionModeService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchPersonalStatus(): Promise<PersonalStatus> {
        return this.graphQLClient
            .query<any>(
                `
query {
  me {
    upcomingTasks: tasks(input: {
      status: UPCOMING
    }) {
      ...taskPreview
    }
    deliveredTasks: tasks(input: {
      status: DELIVERED
    }) {
      ...taskPreview
    }
  }
}

fragment taskPreview on Task {
  id
  goal
  dueAt
  owner {
    id
    firstName
    lastName
    profileUrl
  }
  availableActions
}
`,
            )
            .then((payload: any) => {
                return {
                    upcomingTasks: payload?.me?.upcomingTasks || [],
                    deliveredTasks: payload?.me?.deliveredTasks || [],
                };
            });
    }

    public fetchTeamStatus(): Promise<TeamStatus> {
        return this.graphQLClient
            .query<any>(
                `
query {
  executionMode {
    teamStatus {
      upcomingTasks {
       ...taskPreview
      }
      inProgressTasks {
       ...taskPreview
      }
      deliveredTasks {
       ...taskPreview
      }
    }
  }
}
fragment taskPreview on Task {
  id
  goal
  dueAt
  owner {
    id
    firstName
    lastName
    profileUrl
  }
  availableActions
}
`,
            )
            .then((payload: any) => {
                return payload?.executionMode?.teamStatus;
            });
    }
}
