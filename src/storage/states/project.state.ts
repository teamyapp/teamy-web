export class ProjectState {
    constructor(
        public id: number,
        public name: string,
        public expectedStartAt: Date,
        public expectedEndAt: Date,
        public creatorId: number,
        public createdAt: Date,
        public teamId: number,
        public actualStartAt?: Date,
        public actualEndAt?: Date,
        public updatedAt?: Date,

    ) {}

    static fromJson(json: any): ProjectState {
        return new ProjectState(
            json.id,
            json.name,
            json.expectedStartAt,
            json.expectedEndAt,
            json.creatorId,
            json.createdAt,
            json.teamId,
            json.actualStartAt,
            json.actualEndAt,
            json.updatedAt,
        );
    }

    static fromMutationPayload(json: any): ProjectState {
        return new ProjectState(
            json.ID,
            json.Name,
            json.ExpectedStartAt,
            json.ExpectedEndAt,
            json.CreatorID,
            json.CreatedAt,
            json.TeamID,
            json.ActualStartAt,
            json.ActualEndAt,
            json.UpdatedAt,
        );
    }
}
