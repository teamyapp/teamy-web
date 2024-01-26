import { FilterGroup, StaticGroup } from "@core/entity/group";
import { LocalStore } from "../syncer/localStore";
import { FilterGroupState, GroupState } from "../states/group.state";
import { AppNode } from "./app.node";
import { RolloutNode } from "./rollout.node";
import { MemberGroupRelationState } from "../states/memberGroupRelation.state";

export class FilterGroupNode implements FilterGroup {
        constructor(
            private localStore: LocalStore,
            private group: GroupState,
            private filterGroup: FilterGroupState,
        ) {}
    
        public get id(): number {
            return this.group.id;
        }

        public get type(): 'FILTER' {
            return 'FILTER'
        }

        public get name(): string {
            return this.group.name;
        }

        public get filter(): string {
            return this.filterGroup.filter;
        }

        public get memberCount(): number {
            return this.filterGroup.memberCount;
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
                return new RolloutNode(this.localStore, appState.rollouts[rolloutId]);
            })
        }

        public get app(): AppNode {
            return new AppNode(this.localStore, this.localStore.getState().apps[this.group.appId]);
        }
}


export class StaticGroupNode<MemberNode> implements StaticGroup<MemberNode> {
        constructor(
            private localStore: LocalStore,
            private group: GroupState,
            private membersGroupRelations: MemberGroupRelationState[],
            private makeMemberNode: (memberId: number) => MemberNode,
        ) {}
    
        public get id(): number {
            return this.group.id;
        }
    
        public get type(): 'STATIC' {
            return 'STATIC'
        }
    
        public get name(): string {
            return this.group.name;
        }
    
        public get members(): MemberNode[] {
            return this.membersGroupRelations.filter((memberGroupRelation) => {
                return memberGroupRelation.groupId === this.id;
            }).map((memberGroupRelation) => {
                return this.makeMemberNode(memberGroupRelation.memberId);
            });
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
                return new RolloutNode(this.localStore, appState.rollouts[rolloutId]);
            })
        }

        public get app(): AppNode {
            return new AppNode(this.localStore, this.localStore.getState().apps[this.group.appId]);
        }
}