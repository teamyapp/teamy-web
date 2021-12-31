import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { PersonalStatus } from '@core/entity/personalStatus';
import { TeamStatus } from '@core/entity/teamStatus';

import * as queries from './queries';

export class StatusService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchPersonalStatus(
        userId: number,
        policy: FetchPolicy,
    ): Promise<PersonalStatus> {
        return this.graphQLClient
            .query({
                query: queries.personalStatus,
                variables: { userId: userId },
                fetchPolicy: policy,
            })
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
            .query({ query: queries.teamStatus, fetchPolicy: policy })
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
