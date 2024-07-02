export class ProjectPhaseRelationState {
    constructor(
        public projectId: number,
        public phaseId: number,
    ) {}

    public static fromMutationPayload(json: any): ProjectPhaseRelationState {
        return new ProjectPhaseRelationState(json.ProjectID, json.PhaseID);
    }

    public static fromJson(json: any): ProjectPhaseRelationState {
        return new ProjectPhaseRelationState(json.projectId, json.phaseId);
    }
}
