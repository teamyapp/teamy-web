export type PhaseStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';


export class PhaseState {
    constructor(
        public id: number,
        public name: string,
        public status: PhaseStatus,
        public expectedStartAt: Date,
        public expectedEndAt: Date,
        public createdAt: Date,
        public creatorId: number,
        public updatedAt?: Date,
        public actualStartAt?: Date,
        public actualEndAt?: Date,
    ) {}

    public static fromMutationPayload(json: any): PhaseState {
        return new PhaseState(
            json.ID,
            json.Name,
            json.Status,
            new Date(json.ExpectedStartAt),
            new Date(json.ExpectedEndAt),
            new Date(json.CreatedAt),
            json.CreatorID,
            new Date(json.UpdatedAt),
            new Date(json.ActualStartAt),
            new Date(json.ActualEndAt),
        );
    }

    public static fromJson(json: any): PhaseState {
        return new PhaseState(
            json.id,
            json.name,
            json.status,
            new Date(json.expectedStartAt),
            new Date(json.expectedEndAt),
            new Date(json.createdAt),
            json.creatorId,
            new Date(json.updatedAt),
            new Date(json.actualStartAt),
            new Date(json.actualEndAt),
        );
    }
}