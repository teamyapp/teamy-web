import PersonalStatus from '../entity/PersonalStatus';
import TeamStatus from '../entity/TeamStatus';
import { GraphQLClient } from '../network/GraphQL.client';

interface ExecutionModeQueryPayload {
    executionMode: GQLExecutionMode;
}

interface GQLExecutionMode {
    personalStatus: PersonalStatus;
    teamStatus: TeamStatus;
}

export class ExecutionModeService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchPersonalStatus(): Promise<PersonalStatus> {
        return this.graphQLClient
            .query<ExecutionModeQueryPayload>(
                `
query {
  executionMode {
    personalStatus {
      upcomingTasks {
       ...taskPreview
      }
      taskNeedAttention {
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
            .then((payload: ExecutionModeQueryPayload) => {
                return payload?.executionMode?.personalStatus;
            });
    }

    public fetchTeamStatus(): Promise<TeamStatus> {
        return this.graphQLClient
            .query<ExecutionModeQueryPayload>(
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
            .then((payload: ExecutionModeQueryPayload) => {
                return payload?.executionMode?.teamStatus;
            });
    }
}
