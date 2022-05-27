import { Invitation } from '@core/entityv2/invitation';
import {gql} from "@apollo/client";
import {GraphQLClient} from "@lib/network/GraphQL.client";
import {CreateInvitationInput} from "@core/entity/input";

export interface UpdateInvitationInput {
    receiverFirstName?: string;
    receiverLastName?: string;
    expireAt: Date;
}

export class InvitationClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public getInvitations(teamId: number): Promise<Invitation[]> {
        // TODO: implement me
        return Promise.resolve([]);
    }

    public createInvitation(teamId: number, input: CreateInvitationInput): Promise<Invitation> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation createInvitation($teamId: ID!, $input: CreateInvitationInput!) {
                    createInvitation(teamId: $teamId, invitation: $input) {
                        id
                    }
                }
            `,
            variables: {
                teamId,
                input,
            },
        })
        .then((payload: any) => payload?.createInvitation);
    }

    public updateInvitation(invitationId: number, input: UpdateInvitationInput): Promise<Invitation> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation updateInvitation($invitationId: ID!, $input: UpdateInvitationInput!) {
                    updateInvitation(invitationId: $invitationId, input: $input) {
                        id
                    }
                }
            `,
            variables: {
                invitationId,
                input,
            },
        })
        .then((payload: any) => payload?.updateInvitation);
    }

    public deleteInvitation(invitationId: number): Promise<Invitation> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation deleteInvitation($invitationId: ID!) {
                    deleteInvitation(invitationId: $invitationId) {
                        id
                    }
                }
            `,
            variables: {
                invitationId,
            },
        })
        .then((payload: any) => payload.deleteInvitation);
    }

    public getInvitation(invitationId: number, invitationCode: string): Promise<Invitation> {
        return this.graphQLClient.query({
            query: gql`
                query getInvitations($invitationId: ID, $invitationCode: String) {
                    invitations(filter: {
                        invitationId: $invitationId
                        code: $invitationCode
                    }) {
                        id
                        expireAt
                        code
                    }
                }`,
            variables: {
                invitationId,
                invitationCode,
            },
        })
        .then((payload: any) => payload?.invitations[0]);
    }

    public acceptInvitation(invitationId: number, invitationCode: string): Promise<Invitation> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation acceptInvitation($invitationId: ID!, $invitationCode: String!) {
                    acceptInvitation(invitationId: $invitationId, invitationCode: $invitationCode) {
                        id
                    }
                }
            `,
            variables: {
                invitationId,
                invitationCode,
            },
        })
        .then((payload: any) => payload?.acceptInvitation);
    }

    public declineInvitation(invitationId: number, invitationCode: string): Promise<Invitation> {
        return this.graphQLClient.mutate({
            mutation: gql`
                mutation declineInvitation($invitationId: ID!, $invitationCode: String!) {
                    declineInvitation(invitationId: $invitationId, invitationCode: $invitationCode) {
                        id
                    }
                }
            `,
            variables: {
                invitationId,
                invitationCode,
            },
        })
        .then((payload: any) => payload?.declineInvitation);
    }
}
