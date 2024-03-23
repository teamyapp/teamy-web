export class ProjectState {
    constructor(
        public id: number,
        public name: string,
        public expectedStartAt: Date,
        public expectedEndAt: Date,
        public creatorId: number,
        public createdAt: Date,
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
            json.actualStartAt,
            json.actualEndAt,
            json.updatedAt,
        );
    }

    static fromMutationPayload(json: any): ProjectState {
        return new ProjectState(
            json.id,
            json.name,
            json.expectedStartAt,
            json.expectedEndAt,
            json.creatorId,
            json.createdAt,
            json.actualStartAt,
            json.actualEndAt,
            json.updatedAt,
        );
    }
}
