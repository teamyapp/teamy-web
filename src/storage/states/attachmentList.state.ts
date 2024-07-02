export type RemoteAttachmentListOwnerType = 'TASK';

export class AttachmentListState {
    public constructor(
        public ownerType: RemoteAttachmentListOwnerType,
        public ownerId: number,
        public listLabel: string,
        public listId: number,
        public createdAt: Date,
        public updatedAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): AttachmentListState {
        return new AttachmentListState(
            json.OwnerType,
            json.OwnerID,
            json.ListLabel,
            json.ListID,
            new Date(json.CreatedAt),
            json.UpdatedAt ? new Date(json.UpdatedAt) : undefined,
        );
    }

    public static fromJson(json: any): AttachmentListState {
        return new AttachmentListState(
            json.ownerType,
            json.ownerId,
            json.listLabel,
            json.listId,
            new Date(json.createdAt),
            json.updatedAt ? new Date(json.updatedAt) : undefined,
        );
    }
}
