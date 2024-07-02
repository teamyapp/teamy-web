import { RemoteAttachmentList } from './remoteAttachmentList';

export type RemoteAttachmentType = 'IMAGE';
export interface RemoteAttachment {
    id: string;
    type: RemoteAttachmentType;
    url: string;
    size: number;
    createdAt: string;
    attachmentList: RemoteAttachmentList;
}
