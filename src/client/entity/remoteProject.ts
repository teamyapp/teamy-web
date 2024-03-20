import { RemotePhase } from "./remotePhase";
import { RemoteStory } from "./remoteStory";
import { RemoteUser } from "./remoteUser";

export interface RemoteProject {
    id: string;
    name: string;
    expectedStartAt: Date;
    actualStartAt?: Date;
    expectedEndAt: Date;
    actualEndAt?: Date;
    creator: RemoteUser;
    createdAt: Date;
    updatedAt?: Date;
    phases: RemotePhase[];
    stories: RemoteStory[];
}