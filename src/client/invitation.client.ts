import { print } from 'graphql';
import { GraphQLClient } from '@lib/network/GraphQL.client';
import {
    RemoteCreateInvitationInput,
    RemoteUpdateInvitationInput,
} from '@core/client/entity/input';
import { RemoteInvitation } from '@core/client/entity/remoteInvitation';
import getInvitations from './graphql/query/getInvitations.graphql';
import getInvitationsByTeamId from './graphql/query/getInvitationsByTeamId.graphql';
import createInvitation from './graphql/mutation/createInvitation.graphql';
import updateInvitation from './graphql/mutation/updateInvitation.graphql';
import acceptInvitation from './graphql/mutation/acceptInvitation.graphql';
import deleteInvitation from './graphql/mutation/deleteInvitation.graphql';
import declineInvitation from './graphql/mutation/declineInvitation.graphql';
import addInvitationToTeamMemberGroup from './graphql/mutation/addInvitationToTeamMemberGroup.graphql';  
import removeInvitationFromTeamMemberGroup from './graphql/mutation/removeInvitationFromTeamMemberGroup.graphql';

export class InvitationClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .query({
                query: print(getInvitations),
                variables: {
                    invitationId,
                    invitationCode,
                },
            })
            .then((payload: any) => payload?.invitations[0]);
    }

    public getInvitations(teamId: string): Promise<RemoteInvitation[]> {
        return this.graphQLClient
            .query({
                query: print(getInvitationsByTeamId),
                variables: {
                    teamId,
                },
            })
            .then((payload: any) => payload?.teams[0]?.invitations);
    }

    public createInvitation(
        teamId: string,
        input: RemoteCreateInvitationInput,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(createInvitation),
                variables: {
                    teamId,
                    input,
                },
            })
            .then((payload: any) => payload?.createInvitation);
    }

    public updateInvitation(
        invitationId: string,
        input: RemoteUpdateInvitationInput,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(updateInvitation),
                variables: {
                    invitationId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateInvitation);
    }

    public deleteInvitation(invitationId: string): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(deleteInvitation),
                variables: {
                    invitationId,
                },
            })
            .then((payload: any) => payload.deleteInvitation);
    }

    public acceptInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(acceptInvitation),
                variables: {
                    invitationId,
                    invitationCode,
                },
            })
            .then((payload: any) => payload?.acceptInvitation);
    }

    public declineInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(declineInvitation),
                variables: {
                    invitationId,
                    invitationCode,
                },
            })
            .then((payload: any) => payload?.declineInvitation);
    }

    public addInvitationToTeamMemberGroup(
        invitationId: string,
        teamMemberGroupId: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(addInvitationToTeamMemberGroup),
                variables: {
                    invitationId,
                    teamMemberGroupId,
                },
            })
            .then(
                (payload: any) =>
                    payload?.addInvitationToTeamMemberGroup,
            );
    }

    public removeInvitationFromTeamMemberGroup(
        invitationId: string,
        teamMemberGroupId: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: print(removeInvitationFromTeamMemberGroup),
                variables: {
                    invitationId,
                    teamMemberGroupId,
                },
            })
            .then(
                (payload: any) =>
                    payload?.removeInvitationFromTeamMemberGroup,
            );
    }
}
