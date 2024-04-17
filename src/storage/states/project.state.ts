export class ProjectState {
    constructor(
        public id: number,
        public name: string,
        public creatorId: number,
        public createdAt: Date,
        public teamId: number,
        public actualStartAt?: Date,
        public actualEndAt?: Date,
        public updatedAt?: Date,
        public expectedStartAt?: Date,
        public expectedEndAt?: Date,
        public iconUrl?: string,
        public color?: string,
    ) {}

    static fromJson(json: any): ProjectState {
        return new ProjectState(
            json.ID,
            json.Name,
            json.CreatorID,
            json.CreatedAt,
            json.TeamID,
            json.ActualStartAt,
            json.ActualEndAt,
            json.UpdatedAt,
            json.ExpectedStartAt,
            json.ExpectedEndAt,
            json.IconURL,
            json.Color,
        );
    }

    static fromMutationPayload(json: any): ProjectState {
        return new ProjectState(
            json.id,
            json.name,
            json.creatorId,
            json.createdAt,
            json.teamId,
            json.actualStartAt,
            json.actualEndAt,
            json.updatedAt,
            json.expectedStartAt,
            json.expectedEndAt,
            json.iconUrl,
            json.color,
        );
    }
}
