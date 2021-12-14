import { FetchPolicy } from '@apollo/client';
import PersonalStatus from '../entity/PersonalStatus';
import TeamStatus from '../entity/TeamStatus';
import { GraphQLClient } from '../network/GraphQL.client';
import { QueryPersonalStatus, QueryTeamStatus } from './queries';



export class ExecutionModeService {
  private readonly graphQLClient: GraphQLClient;

  constructor(graphQLClient: GraphQLClient) {
    this.graphQLClient = graphQLClient;
  }

  public fetchPersonalStatus(userId: number, policy: FetchPolicy): Promise<PersonalStatus> {
    return this.graphQLClient
      .query({ query: QueryPersonalStatus, variables: { userId: userId }, fetchPolicy: policy })
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

  public fetchTeamStatus(policy: FetchPolicy): Promise<TeamStatus> {
    return this.graphQLClient
      .query({query: QueryTeamStatus, fetchPolicy: policy})
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
