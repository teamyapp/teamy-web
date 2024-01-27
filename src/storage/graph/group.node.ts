import { FilterGroup, GroupInfo, GroupType, StaticGroup } from '@core/entity/group';

import { FilterGroupState, GroupState } from '../states/group.state';
import { MemberGroupRelationState } from '../states/memberGroupRelation.state';
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
        return this.group.rolloutIds.map((rolloutId) => {
            return new RolloutNode(
                this.localStore,
                appState.rollouts[rolloutId],
            );
        });
    }

    public get app(): AppNode {
        return new AppNode(
            this.localStore,
            this.localStore.getState().apps[this.group.appId],
        );
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
        private membersGroupRelations: MemberGroupRelationState[],
        private makeMemberNode: (memberId: number) => MemberNode,
    ) {
        super(localStore, group);
    }

    public get type(): 'STATIC' {
        return 'STATIC';
    }

    public get members(): MemberNode[] {
        return this.membersGroupRelations
            .filter((memberGroupRelation) => {
                return memberGroupRelation.groupId === this.id;
            })
            .map((memberGroupRelation) => {
                return this.makeMemberNode(memberGroupRelation.memberId);
            });
    }
}
