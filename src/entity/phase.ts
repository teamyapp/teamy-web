import { Story } from "./story";
import { User } from "./user";

export type PhaseStatus = 'TODO' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

export interface Phase {
    id: number;
    name: string;
    status: PhaseStatus;
    expectedStartAt: Date;
    actualStartAt?: Date;
    expectedEndAt: Date;
    actualEndAt?: Date;
    creator: User;
    createdAt: Date;
    updatedAt?: Date;
    stories: Story[];
    totalStories: number;
    deliveredStories: number;
}