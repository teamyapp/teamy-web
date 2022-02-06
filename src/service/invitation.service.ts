import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { CreateInvitationInput } from '@core/entity/input';
import { Invitation } from '@core/entity/invitation';
import * as mutations from '@core/service/mutations';

import * as queries from './queries';

export class InvitationService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public async createInvitation(
        input: CreateInvitationInput,
    ): Promise<string> {
        const result = await this.graphQLClient.mutate({
            mutation: mutations.createInvitation,
            variables: {
                input,
            },
        });
        return result.createInvitation.invitation.code;
    }

    public async findInvitationsForTeam(
        teamId: string,
        policy: FetchPolicy,
    ): Promise<Invitation[]> {
        const result = await this.graphQLClient.query({
            query: queries.teamInvitations,
            variables: {
                teamId,
            },
            fetchPolicy: policy,
        });
        return Array.from(result.teams[0]?.invitations || []);
    }

    public async findInvitationByCode(
        invitationCode: string,
    ): Promise<Invitation> {
        const result = await this.graphQLClient.query({
            query: queries.invitations,
            variables: {
                filter: {
                    code: invitationCode,
                },
            },
        });
        return result?.invitations[0];
    }

    public async acceptInvitation(invitationCode: string): Promise<void> {
        await this.graphQLClient.mutate({
            mutation: mutations.acceptInvitation,
            variables: {
                code: invitationCode,
            },
        });
    }

    public async declineInvitation(invitationCode: string): Promise<void> {
        await this.graphQLClient.mutate({
            mutation: mutations.declineInvitation,
            variables: {
                code: invitationCode,
            },
        });
    }

    public async deleteInvitation(id: string): Promise<void> {
        await this.graphQLClient.mutate({
            mutation: mutations.deleteInvitation,
            variables: {
                id: id,
            },
        });
    }
}
