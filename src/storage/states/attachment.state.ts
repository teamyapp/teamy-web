export type AttachmentType = 'IMAGE';

export class AttachmentState {
    public constructor(
        public id: number,
        public type: AttachmentType,
        public url: string,
        public size: number,
        public createdAt: Date,
        public attachmentListId: number,
    ) {}

    public static fromMutationPayload(json: any): AttachmentState {
        return new AttachmentState(
            json.ID,
            json.Type,
            json.URL,
            json.Size,
            new Date(json.CreatedAt),
            json.AttachmentListID,
        );
    }

    public static fromJson(json: any): AttachmentState {
        return new AttachmentState(
            json.id,
            json.type,
            json.url,
            json.size,
            new Date(json.createdAt),
            json.attachmentListId,
        );
    }
}