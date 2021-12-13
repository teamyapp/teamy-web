import PersonalStatus from '../entity/PersonalStatus';
import TeamStatus from '../entity/TeamStatus';
import { GraphQLClient } from '../network/GraphQL.client';

export class ExecutionModeService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchPersonalStatus(userId: number): Promise<PersonalStatus> {
        return this.graphQLClient
            .query<any>(
                `
query personalStatus($userId: ID!) {
  me {
    id
    activeTeam {
      id
      tasksNeedAttention(isMine: true) {
         ...taskPreview
      }
      upcomingTasks: tasks(input: {
        status: UPCOMING
        ownerId: $userId
      }) {
        ...taskPreview
      }
      deliveredTasks: tasks(input: {
          status: DELIVERED
          ownerId: $userId
      }) {
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
                {
                    userId: userId,
                },
            )
            .then((payload: any) => {
                return {
                    needAttentionTask:
                        payload?.me?.activeTeam?.tasksNeedAttention[0],
                    upcomingTasks: payload?.me?.activeTeam?.upcomingTasks || [],
                    deliveredTasks:
                        payload?.me?.activeTeam?.deliveredTasks || [],
                };
            });
    }

    public fetchTeamStatus(): Promise<TeamStatus> {
        return this.graphQLClient
            .query<any>(
                `
query {
  me {
    id
    activeTeam {
      id
      upcomingTasks: tasks(input: {
        status: UPCOMING
      }) {
        ...taskPreview
      }
      inProgressTasks: tasks(input: {
        status: IN_PROGRESS
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
                    upcomingTasks: payload?.me?.activeTeam?.upcomingTasks || [],
                    inProgressTasks:
                        payload?.me?.activeTeam?.inProgressTasks || [],
                    deliveredTasks:
                        payload?.me?.activeTeam?.deliveredTasks || [],
                };
            });
    }
}
