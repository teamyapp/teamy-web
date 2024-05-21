import {
    AttachmentList,
    AttachmentListOwnerType,
} from '@core/entity/attachmentList';
import { AttachmentListState } from '../states/attachmentList.state';
import { LocalStore } from '../syncer/localStore';
import { AttachmentNode } from './attachment.node';

export class AttachmentListNode implements AttachmentList {
    constructor(
        private localStore: LocalStore,
        private attachmentListState: AttachmentListState,
    ) {}

    public get ownerType(): AttachmentListOwnerType {
        return this.attachmentListState.ownerType;
    }

    public get ownerId(): number {
        return this.attachmentListState.ownerId;
    }

    public get listLabel(): string {
        return this.attachmentListState.listLabel;
    }

    public get listId(): number {
        return this.attachmentListState.listId;
    }

    public get createdAt(): Date {
        return this.attachmentListState.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.attachmentListState.updatedAt;
    }

    public get attachments(): AttachmentNode[] {
        const appState = this.localStore.getState();
        const attachments = [];
        for (const attachmentId in appState.attachments) {
            const attachment = appState.attachments[attachmentId];
            if (attachment.attachmentListId === this.listId) {
                attachments.push(new AttachmentNode(this.localStore, attachment));
            }
        }

        return attachments;
    }
}
