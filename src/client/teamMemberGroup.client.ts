import { GraphQLClient } from '@lib/network/GraphQL.client';
import {
    CreateTeamMemberGroupInput,
    UpdateTeamMemberGroupInput,
} from '@core/entity/input';
import createTeamMemberGroup from './graphql/mutation/createTeamMemberGroup.graphql';
import updateTeamMemberGroup from './graphql/mutation/updateTeamMemberGroup.graphql';
import addUserToTeamMemberGroup from './graphql/mutation/addUserToTeamMemberGroup.graphql';
import removeUserFromTeamMemberGroup from './graphql/mutation/removeUserFromTeamMemberGroup.graphql';
import deleteTeamMemberGroup from './graphql/mutation/deleteTeamMemberGroup.graphql';
import { print } from 'graphql';
import { RemoteTeamMemberGroup } from './entity/remoteTeamMemberGroup';
import { RemoteUser } from './entity/remoteUser';

export class TeamMemberGroupClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public createTeamMemberGroup(
        teamId: string,
        input: CreateTeamMemberGroupInput,
    ): Promise<RemoteTeamMemberGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(createTeamMemberGroup),
                variables: {
                    teamId,
                    input,
                },
            })
            .then((payload: any) => payload?.createTeamMemberGroup);
    }

    public updateTeamMemberGroup(
        id: string,
        input: UpdateTeamMemberGroupInput,
    ): Promise<RemoteTeamMemberGroup> {
        return this.graphQLClient
            .mutate({
                mutation: print(updateTeamMemberGroup),
                variables: {
                    id,
                    input,
                },
            })
            .then((payload: any) => payload?.updateTeamMemberGroup);
    }

    public addUserToTeamMemberGroup(
        id: string,
        userId: string,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: print(addUserToTeamMemberGroup),
                variables: {
                    id,
                    userId,
                },
            })
            .then((payload: any) => payload?.addUserToTeamMemberGroup);
    }

    public removeUserFromTeamMemberGroup(
        id: string,
        userId: string,
    ): Promise<RemoteUser> {
        return this.graphQLClient
            .mutate({
                mutation: print(removeUserFromTeamMemberGroup),
                variables: {
                    id,
                    userId,
                },
            })
            .then((payload: any) => payload?.removeUserFromTeamMemberGroup);
    }

    public deleteTeamMemberGroup(id: string): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: print(deleteTeamMemberGroup),
                variables: {
                    id,
                },
            })
            .then(() => undefined);
    }
}
