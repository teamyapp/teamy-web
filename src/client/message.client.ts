import { gql } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { RemoteMessage } from '@core/client/entity/remoteMessage';
import { CreateMessageInput, UpdateMessageInput } from '@core/entity/input';

export class MessageClient {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public createMessage(
        threadId: number,
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
                        }
                    }
                `,
                variables: {
                    threadId,
                    input,
                },
            })
            .then((payload: any) => payload?.createMessage);
    }

    public updateMessage(
        messageId: number,
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

    public deleteMessage(messageId: number): Promise<RemoteMessage> {
        return this.graphQLClient
            .mutate({
                mutation: gql`
                    mutation deleteMessage($messageId: ID!) {
                        deleteMessage(messageId: $messageId) {
                            id
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
