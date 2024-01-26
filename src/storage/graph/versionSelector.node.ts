import {
    ExperimentVersionSelector,
    StaticVersionSelector,
    VersionSelectorInfo,
} from '@core/entity/rollout';

import {
    ExperimentVersionSelectorState,
    StaticVersionSelectorState,
    VersionSelectorState,
} from '../states/versionSelector.state';
import { LocalStore } from '../syncer/localStore';

export class VersionSelectorNode implements VersionSelectorInfo {
    constructor(
        protected localStore: LocalStore,
        protected versionSelector: VersionSelectorState,
    ) {}

    get id(): number {
        return this.versionSelector.id;
    }

    get type(): 'STATIC' | 'EXPERIMENT' {
        return this.versionSelector.type;
    }

    get createdAt(): Date {
        return this.versionSelector.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.versionSelector.updatedAt;
    }
}

export class StaticVersionSelectorNode
    extends VersionSelectorNode
    implements StaticVersionSelector
{
    constructor(
        protected localStore: LocalStore,
        protected versionSelector: VersionSelectorState,
        private staticVersionSelector: StaticVersionSelectorState,
    ) {
        super(localStore, versionSelector);
    }

    get type(): 'STATIC' {
        return 'STATIC';
    }

    get versionNumber(): number {
        return this.staticVersionSelector.versionNumber;
    }
}

export class ExperimentVersionSelectorNode
    extends VersionSelectorNode
    implements ExperimentVersionSelector
{
    constructor(
        protected localStore: LocalStore,
        protected versionSelector: VersionSelectorState,
        private experimentVersionSelector: ExperimentVersionSelectorState,
    ) {
        super(localStore, versionSelector);
    }

    get type(): 'EXPERIMENT' {
        return 'EXPERIMENT';
    }

    get versionNumbers(): number[] {
        return this.experimentVersionSelector.versionNumbers;
    }
}
