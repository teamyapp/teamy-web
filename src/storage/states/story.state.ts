import { toDate } from './parser';

export type StoryStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export class StoryState {
    constructor(
        public id: number,
        public name: string,
        public status: StoryStatus,
        public creatorId: number,
        public createdAt: Date,
        public isPlanned: boolean,
        public ownerId?: number,
        public updatedAt?: Date,
        public priority?: Priority,
    ) {}

    public static fromMutationPayload(json: any): StoryState {
        return new StoryState(
            json.ID,
            json.Name,
            json.Status,
            json.CreatorID,
            toDate(json.CreatedAt)!,
            json.IsPlanned,
            json.OwnerID,
            toDate(json.UpdatedAt),
            json.Priority,
        );
    }

    public static fromJson(json: any): StoryState {
        return new StoryState(
            json.id,
            json.name,
            json.status,
            json.creatorId,
            toDate(json.createdAt)!,
            json.isPlanned,
            json.ownerId,
            toDate(json.updatedAt),
            json.priority,
        );
    }
}
