export class StoryTaskRelationState {
    public constructor(
        public storyId: number,
        public taskId: number,
    ) {}

    public static fromMutationPayload(json: any): StoryTaskRelationState {
        return new StoryTaskRelationState(json.StoryID, json.TaskID);
    }

    public static fromJson(json: any): StoryTaskRelationState {
        return new StoryTaskRelationState(json.storyId, json.taskId);
    }
}
