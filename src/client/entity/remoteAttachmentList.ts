import { RemoteAttachment } from './remoteAttachment';
export type RemoteAttachmentListOwnerType = 'TASK';

export interface RemoteAttachmentList {
    ownerType: RemoteAttachmentListOwnerType;
    ownerId: string;
    listLabel: string;
    listId: string;
    createdAt: string;
    updatedAt?: string;
    attachments: RemoteAttachment[];
}
