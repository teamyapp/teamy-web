import { Attachment, AttachmentType } from '@core/entity/attachment';
import { LocalStore } from '../syncer/localStore';
import { AttachmentListNode } from './attachmentList.node';
import { AttachmentState } from '../states/attachment.state';

export class AttachmentNode implements Attachment {
    constructor(
        private localStore: LocalStore,
        private attachment: AttachmentState,
    ) {}

    public get id(): number {
        return this.attachment.id;
    }

    public get type(): AttachmentType {
        return this.attachment.type;
    }

    public get url(): string {
        return this.attachment.url;
    }

    public get size(): number {
        return this.attachment.size;
    }

    public get createdAt(): Date {
        return this.attachment.createdAt;
    }

    public get attachmentList(): AttachmentListNode {
        const appState = this.localStore.getState();
        const attachmentListState =
            appState.attachmentLists[this.attachment.attachmentListId];
        return new AttachmentListNode(this.localStore, attachmentListState);
    }
}
