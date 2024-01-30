import { Rollout } from '@core/entity/rollout';

import { RolloutState } from '../states/rollout.state';
import { LocalStore } from '../syncer/localStore';
import {
    ActivatorNode,
    MaxViewersActivatorNode,
    PercentageActivatorNode,
    StaticActivatorNode,
    TimeRangeActivatorNode,
} from './activator.node';
import { ExperimentVersionSelectorNode, StaticVersionSelectorNode } from './versionSelector.node';
import { FilterGroupNode, GroupNode, StaticGroupNode } from './group.node';
import { UserNode } from './user.node';
import { TeamNode } from './team.node';

export class RolloutNode implements Rollout {
    constructor(
        private localStore: LocalStore,
        private rollout: RolloutState,
    ) {}

    get id(): number {
        return this.rollout.id;
    }

    get name(): string {
        return this.rollout.name;
    }

    get isEnabled(): boolean {
        return this.rollout.isEnabled;
    }

    get createdAt(): Date {
        return this.rollout.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.rollout.updatedAt;
    }

    get activator(): ActivatorNode {
            const appState = this.localStore.getState();
            const activator = appState.activators[this.rollout.activatorId];

            switch (activator.type) {
                case 'STATIC':
                    return new StaticActivatorNode(this.localStore, activator);
                case 'TIME_RANGE':
                    const timeRangeActivator = appState.timeRangeActivators[activator.id];
                    return new TimeRangeActivatorNode(this.localStore, activator, timeRangeActivator);
                case 'MAX_VIEWERS':
                    const maxViewersActivator = appState.maxViewersActivators[activator.id];
                    return new MaxViewersActivatorNode(this.localStore, activator, maxViewersActivator);
                case 'PERCENTAGE':
                    const percentageActivator = appState.percentageActivators[activator.id];
                    return new PercentageActivatorNode(this.localStore, activator, percentageActivator);
            }
    }

    get versionSelector(): StaticVersionSelectorNode | ExperimentVersionSelectorNode {
        const appState = this.localStore.getState();
        const versionSelector = appState.versionSelectors[this.rollout.versionSelectorId];

        switch (versionSelector.type) {
            case 'STATIC':
                const staticVersionSelector = appState.staticVersionSelectors[versionSelector.id];
                return new StaticVersionSelectorNode(this.localStore, versionSelector, staticVersionSelector);
            case 'EXPERIMENT':
                const experimentVersionSelector = appState.experimentVersionSelectors[versionSelector.id];
                return new ExperimentVersionSelectorNode(this.localStore, versionSelector, experimentVersionSelector);
        }
    }


    get groups(): GroupNode[] {
        const appState = this.localStore.getState();
        
        return appState.groupRolloutRelations.filter((groupRolloutRelation) => {
            return groupRolloutRelation.rolloutId === this.rollout.id;
        }).map((groupRolloutRelation) => {
            const group = appState.groups[groupRolloutRelation.groupId];

            switch (group.type) {
                case 'FILTER':
                    const filterGroup = appState.filterGroups[group.id];
                    return new FilterGroupNode(this.localStore, group,  filterGroup);
                case 'STATIC':
                    
                    switch (group.memberType) {
                        case 'USER':
                            return new StaticGroupNode<UserNode>(this.localStore, group, (userId: number) => {
                                return new UserNode(this.localStore, appState.users[userId]);
                            });
                        case 'TEAM':
                            return new StaticGroupNode<TeamNode>(this.localStore, group, (teamId: number) => {
                                return new TeamNode(this.localStore, appState.teams[teamId]);
                            });
                    }
            }
        })
    }
}
