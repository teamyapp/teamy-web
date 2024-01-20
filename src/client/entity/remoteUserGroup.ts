import { RemoteApp } from "./remoteApp";
import { RemoteGroupType } from "./remoteGroupType";
import { RemoteRollout } from "./remoteRollout";
import { RemoteUser } from "./remoteUser";

export interface RemoteUserGroup {
    id: string;
    type: RemoteGroupType;
    name: string;
    filter?: string;
    users?: RemoteUser[];
    memberCount?: number;
    createdAt: string;
    updatedAt?: string;
    rollouts: RemoteRollout[]
    app: RemoteApp;
}