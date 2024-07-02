export class ProjectStoryRelationState {
    constructor(
        public projectId: number,
        public storyId: number,
    ) {}

    public static fromMutationPayload(json: any): ProjectStoryRelationState {
        return new ProjectStoryRelationState(json.ProjectID, json.StoryID);
    }

    public static fromJson(json: any): ProjectStoryRelationState {
        return new ProjectStoryRelationState(json.projectId, json.storyId);
    }
}
