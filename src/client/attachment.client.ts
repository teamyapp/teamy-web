import { GraphQLClient } from '@lib/network/GraphQL.client';
import { RemoteAttachment } from './entity/remoteAttachment';

export class AttachmentClient {
    constructor(private graphQLClient: GraphQLClient) {}

    createAttachmentListFileUploadSession(
        attachmentListId: string,
    ): Promise<string> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation createAttachmentListFileUploadSession($attachmentListId: ID!) {
                        createAttachmentListFileUploadSession(attachmentListId: $attachmentListId)
                    }
                `,
                variables: {
                    attachmentListId,
                },
            })
            .then(
                (payload: any) =>
                    payload?.createAttachmentListFileUploadSession,
            );
    }

    finishAttachmentListFileUploadSession(
        attachmentListId: string,
        fileUploadSessionId: string,
    ): Promise<RemoteAttachment> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation finishAttachmentListFileUploadSession(
                        $attachmentListId: ID!
                        $fileUploadSessionId: ID!
                    ) {
                        finishAttachmentListFileUploadSession(
                            attachmentListId: $attachmentListId
                            fileUploadSessionId: $fileUploadSessionId
                        ) {
                            id
                            url
                        }
                    }
                `,
                variables: {
                    attachmentListId,
                    fileUploadSessionId,
                },
            })
            .then(
                (payload: any) =>
                    payload?.finishAttachmentListFileUploadSession,
            );
    }

    deleteAttachmentListFile(
        attachmentId: string,
    ): Promise<void> {
        return this.graphQLClient
            .mutate({
                mutation: `
                    mutation deleteAttachmentListFile($attachmentId: ID!) {
                        deleteAttachmentListFile(attachmentId: $attachmentId) {
                            id
                        }
                    }
                `,
                variables: {
                    attachmentId,
                },
            })
            .then(() => {});
    }
}
