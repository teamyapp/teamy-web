import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import {
    CreateMessageInput,
    UpdateMessageInput,
} from '@core/client/entity/input';
import { RemoteMessage } from '@core/client/entity/remoteMessage';

export class MessageClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public createMessage(
        threadId: string,
        input: CreateMessageInput,
    ): Promise<RemoteMessage> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation createMessage(
                        $threadId: ID!
                        $message: CreateMessageInput!
                    ) {
                        createMessage(threadId: $threadId, message: $message) {
                            id
                            body
                            thread {
                                id
                            }
                            createdAt
                        }
                    }
                `,
                variables: {
                    threadId,
                    message: input,
                },
            })
            .then((payload: any) => payload?.createMessage);
    }

    public updateMessage(
        messageId: string,
        input: UpdateMessageInput,
    ): Promise<RemoteMessage> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation updateMessage(
                        $messageId: ID!
                        $input: UpdateMessageInput!
                    ) {
                        updateMessage(messageId: $messageId, input: $input) {
                            id
                            body
                            thread {
                                id
                            }
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: {
                    messageId,
                    input,
                },
            })
            .then((payload: any) => payload?.updateMessage);
    }

    public deleteMessage(messageId: string): Promise<RemoteMessage> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation deleteMessage($messageId: ID!) {
                        deleteMessage(messageId: $messageId) {
                            id
                            thread {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    messageId,
                },
            })
            .then((payload: any) => payload?.deleteMessage);
    }
}
