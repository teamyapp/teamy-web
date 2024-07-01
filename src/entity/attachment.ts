import { AttachmentList } from './attachmentList';
export type AttachmentType = 'IMAGE';

export interface Attachment {
    id: number;
    type: AttachmentType;
    url: string;
    size: number;
    createdAt: Date;
    attachmentList: AttachmentList;
}
