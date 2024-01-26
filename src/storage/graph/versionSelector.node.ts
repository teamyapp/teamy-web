import { ExperimentVersionSelector, StaticVersionSelector } from "@core/entity/rollout";
import { LocalStore } from "../syncer/localStore";
import { ExperimentVersionSelectorState, StaticVersionSelectorState, VersionSelectorState } from "../states/versionSelector.state";

export class StaticVersionSelectorNode implements StaticVersionSelector {
    constructor(
        private localStore: LocalStore,
        private versionSelector: VersionSelectorState,
        private staticVersionSelector: StaticVersionSelectorState,
    ) {}

    get id(): number {
        return this.versionSelector.id;
    }

    get type(): 'STATIC' {
        return 'STATIC';
    }

    get versionNumber(): number {
        return this.staticVersionSelector.versionNumber;
    }

    get createdAt(): Date {
        return this.versionSelector.createdAt;
    }

    get updatedAt(): Date | undefined {
        return this.versionSelector.updatedAt;
    }
}

export class ExperimentVersionSelectorNode implements ExperimentVersionSelector {
        constructor(
            private localStore: LocalStore,
            private versionSelector: VersionSelectorState,
            private experimentVersionSelector: ExperimentVersionSelectorState,
        ) {}
    
        get id(): number {
            return this.versionSelector.id;
        }
    
        get type(): 'EXPERIMENT' {
            return 'EXPERIMENT'
        }
    
        get versionNumbers(): number[] {
            return this.experimentVersionSelector.versionNumbers;
        }

        get createdAt(): Date {
            return this.versionSelector.createdAt;
        }
    
        get updatedAt(): Date | undefined {
            return this.versionSelector.updatedAt;
        }
}