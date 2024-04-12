export class TaskLinkState {
    public constructor(
        public id: number,
        public taskId: number,
        public title: string,
        public previewTitle: string,
        public url: string,
        public iconUrl?: string,
        public iconHoverUrl?: string,
    ) {}

    public static fromMutationPayload(json: any): TaskLinkState {
        return new TaskLinkState(
            json.ID,
            json.TaskID,
            json.Title,
            json.PreviewTitle,
            json.URL,
            json.IconURL,
            json.IconHoverURL,
        );
    }

    public static fromJson(json: any): TaskLinkState {
        return new TaskLinkState(
            json.id,
            json.taskId,
            json.title,
            json.previewTitle,
            json.url,
            json.iconUrl,
            json.iconHoverUrl,
        );
    }
}
