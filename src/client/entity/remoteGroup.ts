import { RemoteApp } from './remoteApp';
import { RemoteGroupMemberType } from './remoteGroupMemberType';
import { RemoteGroupRolloutRelation } from './remoteGroupRolloutRelation';
import { RemoteGroupType } from './remoteGroupType';
import { RemoteTeam } from './remoteTeam';
import { RemoteUser } from './remoteUser';

export interface RemoteGroup {
    id: string;
    type: RemoteGroupType;
    locked: boolean;
    memberType: RemoteGroupMemberType;
    name: string;
    filter?: string;
    teams?: RemoteTeam[];
    users?: RemoteUser[];
    createdAt: string;
    updatedAt?: string;
    groupRolloutRelations: RemoteGroupRolloutRelation[];
    apps: RemoteApp[];
}
