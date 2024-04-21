export class PhaseStoryRelationState {
    constructor(public phaseId: number, public storyId: number) {}

    public static fromMutationPayload(json: any): PhaseStoryRelationState {
        return new PhaseStoryRelationState(json.PhaseID, json.StoryID);
    }

    public static fromJson(json: any): PhaseStoryRelationState {
        return new PhaseStoryRelationState(json.phaseId, json.storyId);
    }
}
