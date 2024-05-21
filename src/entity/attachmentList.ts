import { Attachment } from './attachment';

export type AttachmentListOwnerType = 'TASK';
export interface AttachmentList {
    ownerType: AttachmentListOwnerType;
    ownerId: number;
    listLabel: string;
    listId: number;
    createdAt: Date;
    updatedAt?: Date;
    attachments: Attachment[];
}
