import { FetchPolicy } from '@apollo/client';

import { GraphQLClient } from '@lib/network/GraphQL.client';

import { Message } from '@core/entity/message';

import * as mutations from './mutations';
import * as queries from './queries';

export class CommentService {
    private readonly graphQLClient: GraphQLClient;

    constructor(graphQLClient: GraphQLClient) {
        this.graphQLClient = graphQLClient;
    }

    public fetchTaskComments(
        taskId: number,
        fetchPolicy: FetchPolicy,
    ): Promise<Message[]> {
        return this.graphQLClient
            .query({
                query: queries.taskComments,
                variables: { taskId: taskId },
                fetchPolicy: fetchPolicy,
            })
            .then((payload: any) => {
                const comments = payload?.task?.comments || [];
                return comments.map((comment: any) => {
                    return {
                        id: comment?.id || -1,
                        author: comment?.commenter,
                        content: comment?.content,
                        createdAt: new Date(Date.parse(comment?.createdAt)),
                    };
                });
            });
    }

    public async createComment(taskId: number, content: string) {
        await this.graphQLClient.mutate({
            mutation: mutations.createComment,
            variables: { taskId: taskId, content: content },
        });
    }

    public async updateComment(commentId: number, content: string) {
        await this.graphQLClient.mutate({
            mutation: mutations.updateComment,
            variables: { commentId: commentId, content: content },
        });
    }

    public async deleteComment(commentId: number) {
        await this.graphQLClient.mutate({
            mutation: mutations.deleteComment,
            variables: { commentId: commentId },
        });
    }
}
