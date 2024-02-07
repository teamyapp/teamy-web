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
import { FilterGroupNode, GroupNode } from './group.node';
import {
    ExperimentVersionSelectorNode,
    StaticVersionSelectorNode,
} from './versionSelector.node';

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
                const timeRangeActivator =
                    appState.timeRangeActivators[activator.id];
                return new TimeRangeActivatorNode(
                    this.localStore,
                    activator,
                    timeRangeActivator,
                );
            case 'MAX_VIEWERS':
                const maxViewersActivator =
                    appState.maxViewersActivators[activator.id];
                return new MaxViewersActivatorNode(
                    this.localStore,
                    activator,
                    maxViewersActivator,
                );
            case 'PERCENTAGE':
                const percentageActivator =
                    appState.percentageActivators[activator.id];
                return new PercentageActivatorNode(
                    this.localStore,
                    activator,
                    percentageActivator,
                );
        }
    }

    get versionSelector():
        | StaticVersionSelectorNode
        | ExperimentVersionSelectorNode {
        const appState = this.localStore.getState();
        const versionSelector =
            appState.versionSelectors[this.rollout.versionSelectorId];

        switch (versionSelector.type) {
            case 'STATIC':
                const staticVersionSelector =
                    appState.staticVersionSelectors[versionSelector.id];
                return new StaticVersionSelectorNode(
                    this.localStore,
                    versionSelector,
                    staticVersionSelector,
                );
            case 'EXPERIMENT':
                const experimentVersionSelector =
                    appState.experimentVersionSelectors[versionSelector.id];
                return new ExperimentVersionSelectorNode(
                    this.localStore,
                    versionSelector,
                    experimentVersionSelector,
                );
        }
    }

    get group(): GroupNode {
        //TODO: We need to figure out how to get the group from the rollout.
        const appState = this.localStore.getState();
        return new FilterGroupNode(
            this.localStore,
            appState.groups[0],
            appState.filterGroups[0],
        );
    }
}
