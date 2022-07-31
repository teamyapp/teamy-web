import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    CreateInvitationInput,
    UpdateInvitationInput,
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
                query: gql`
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
                query: gql`
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
        input: CreateInvitationInput,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
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
        input: UpdateInvitationInput,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
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

    public acceptInvitation(
        invitationId: string,
        invitationCode: string,
    ): Promise<RemoteInvitation> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
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
                mutation: gql`
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
