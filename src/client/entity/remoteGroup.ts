import { RemoteApp } from './remoteApp';
import { RemoteGroupMemberType } from './remoteGroupMemberType';
import { RemoteGroupRolloutRelation } from './remoteGroupRolloutRelation';
import { RemoteGroupType } from './remoteGroupType';
import { RemoteTeam } from './remoteTeam';

export interface RemoteGroup {
    id: string;
    type: RemoteGroupType;
    memberType: RemoteGroupMemberType;
    name: string;
    filter?: string;
    teams?: RemoteTeam[];
    users?: string[];
    memberCount?: number;
    createdAt: string;
    updatedAt?: string;
    groupRolloutRelations: RemoteGroupRolloutRelation[];
    apps: RemoteApp[];
}
