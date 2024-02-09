import { FilterGroup, GroupInfo, GroupType, GroupMemberType, StaticGroup } from '@core/entity/group';
import { FilterGroupState, GroupState } from '../states/group.state';
import { LocalStore } from '../syncer/localStore';
import { AppNode } from './app.node';
import { RolloutNode } from './rollout.node';
import { UserNode } from './user.node';
import { TeamNode } from './team.node';

export type GroupNode = FilterGroupNode | StaticGroupNode<UserNode> | StaticGroupNode<TeamNode>;

class GroupInfoNode implements GroupInfo {
    constructor(
        protected localStore: LocalStore,
        protected group: GroupState,
    ) {}

    public get id(): number {
        return this.group.id;
    }

    public get type(): GroupType {
        return this.group.type;
    }

    public get memberType(): GroupMemberType {
        return this.group.memberType;
    }

    public get name(): string {
        return this.group.name;
    }

    public get createdAt(): Date {
        return this.group.createdAt;
    }

    public get updatedAt(): Date | undefined {
        return this.group.updatedAt;
    }

    public get rollouts(): RolloutNode[] {
        const appState = this.localStore.getState();
        return appState.groupRolloutRelations
        .filter((relation) => relation.groupId === this.group.id)
        .sort((relationA, relationB) => relationA.orderIndex - relationB.orderIndex)
        .map((relation) => {
            return new RolloutNode(this.localStore, appState.rollouts[relation.rolloutId]);
        })
    }

    public get apps(): AppNode[] {
        const appState = this.localStore.getState();
        return appState.appGroupRelations
        .filter((relation) => relation.groupId === this.group.id)
        .map((relation) => {
            return new AppNode(this.localStore, appState.apps[relation.appId]);
        });
    }
}
export class FilterGroupNode extends GroupInfoNode implements FilterGroup {
    constructor(
        protected localStore: LocalStore,
        protected group: GroupState,
        private filterGroup: FilterGroupState,
    ) {
        super(localStore, group);
    }

    public get type(): 'FILTER' {
        return 'FILTER';
    }

    public get filter(): string {
        return this.filterGroup.filter;
    }

    public get memberCount(): number {
        return this.filterGroup.memberCount;
    }
}

export class StaticGroupNode<MemberNode>
    extends GroupInfoNode
    implements StaticGroup<MemberNode>
{
    constructor(
        protected localStore: LocalStore,
        protected group: GroupState,
        private makeMemberNode: (memberId: number) => MemberNode,
    ) {
        super(localStore, group);
    }

    public get type(): 'STATIC' {
        return 'STATIC';
    }

    public get members(): MemberNode[] {
        const appState = this.localStore.getState();
        const groupMemberRelations = appState.groupMemberRelations;

        return groupMemberRelations.filter((relation) => {
            return relation.groupId === this.group.id;
        }).map((relation) => {
            return this.makeMemberNode(relation.memberId);
        })
    }
}
