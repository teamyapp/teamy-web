import { Phase } from './phase';
import { Story } from './story';
import { Team } from './team';
import { User } from './user';

export interface Project {
    id: number;
    name: string;
    expectedStartAt?: Date;
    actualStartAt?: Date;
    expectedEndAt?: Date;
    actualEndAt?: Date;
    creator: User;
    createdAt: Date;
    updatedAt?: Date;
    phases: Phase[];
    stories: Story[];
    unplannedStories: Story[];
    totalPhaseCount: number;
    completedPhaseCount: number;
    iconUrl?: string;
    color?: string;
}
