import { toDate } from "./parser";

export type StoryStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
export type Priority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export class StoryState {
    constructor(
        public id: number,
        public name: string,
        public ownerId: number,
        public status: StoryStatus,
        public creatorId: number,
        public createdAt: Date,
        public updatedAt?: Date,
        public priority?: Priority,
    ) {}

    public static fromMutationPayload(json: any): StoryState {
        return new StoryState(
            json.ID,
            json.Name,
            json.OwnerID,
            json.Status,
            json.CreatorID,
            toDate(json.CreatedAt)!,
            toDate(json.UpdatedAt),
            json.Priority,
        );
    }

    public static fromJson(json: any): StoryState {
        return new StoryState(
            json.id,
            json.name,
            json.ownerId,
            json.status,
            json.creatorId,
            toDate(json.createdAt)!,
            toDate(json.updatedAt),
            json.priority,
        );
    }
}