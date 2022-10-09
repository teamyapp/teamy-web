import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    RemoteCreateInvitationInput,
    RemoteUpdateInvitationInput,
} from '@core/client/entity/input';
import { RemoteInvitation } from '@core/client/entity/remoteInvitation';

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
                operationName: "getInvitations",
                query: `
                    query getInvitations(
                        $invitationId: ID
                        $invitationCode: String
                    ) {
                        invitations(
                            filter: {
                                invitationId: $invitationId
                                code: $invitationCode
                            }
                        ) {
                            id
                            createdAt
                            expireAt
                            code
                            status
                            sender {
                                id
                                lastName
                                firstName
                            }
                            joiningTeam {
                                id
                                name
                                iconUrl
                            }
                        }
                    }
                `,
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
                operationName: "getInvitations",
                query: `
                    query getInvitations($teamId: ID!) {
                        teams(filter: { teamId: $teamId }) {
                            invitations {
                                id
                                receiverFirstName
                                receiverLastName
                                createdAt
                                joiningTeam {
                                    id
                                }
                                expireAt
                                code
                                status
                                code
                            }
                        }
                    }
                `,
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
                operationName: "createInvitation",
                mutation: `
                    mutation createInvitation(
                        $teamId: ID!
                        $input: CreateInvitationInput!
                    ) {
                        createInvitation(teamId: $teamId, invitation: $input) {
                            id
                            receiverFirstName
                            receiverLastName
                            joiningTeam {
                                id
                            }
                            code
                            status
                            createdAt
                            expireAt
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

    public updateInvitation(
        invitationId: string,
        input: RemoteUpdateInvitationInput,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                operationName: "updateInvitation",
                query: `
                    mutation updateInvitation(
                        $invitationId: ID!
                        $input: UpdateInvitationInput!
                    ) {
                        updateInvitation(
                            invitationId: $invitationId
                            input: $input
                        ) {
                            id
                            receiverFirstName
                            receiverFirstName
                            createdAt
                            expireAt
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

    public deleteInvitation(invitationId: string): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                operationName: "deleteInvitation",
                query: `
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

    public acceptInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                operationName: "acceptInvitation",
                query: `
                    mutation acceptInvitation(
                        $invitationId: ID!
                        $invitationCode: String!
                    ) {
                        acceptInvitation(
                            invitationId: $invitationId
                            invitationCode: $invitationCode
                        ) {
                            id
                            status
                            joiningTeam {
                                id
                                members {
                                    id
                                }
                            }
                            receiver {
                                id
                                teams {
                                    id
                                }
                            }
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

    public declineInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                operationName: "declineInvitation",
                query: `
                    mutation declineInvitation(
                        $invitationId: ID!
                        $invitationCode: String!
                    ) {
                        declineInvitation(
                            invitationId: $invitationId
                            invitationCode: $invitationCode
                        ) {
                            id
                            status
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
