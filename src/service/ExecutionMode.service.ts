import TeamStatus from '../entity/TeamStatus';
import { GraphQLClient } from '../network/GraphQL.client';

interface ExecutionModeQueryPayload {
    executionMode: GQLExecutionMode;
}

interface GQLExecutionMode {
    teamStatus: TeamStatus;
}

export class ExecutionModeService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    fetchTeamStatus(): Promise<TeamStatus> {
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
}
`,
            )
            .then((payload: ExecutionModeQueryPayload) => {
                return payload.executionMode.teamStatus;
            });
    }
}
