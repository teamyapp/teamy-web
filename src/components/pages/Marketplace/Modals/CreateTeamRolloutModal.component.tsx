import React, { Component, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import {
    CreateActivatorInput,
    CreateAppRolloutInput,
    CreateVersionSelectorInput,
} from '@core/entity/input';

import { CreateRolloutViewComponent } from './CreateRolloutView.component';
import styles from './CreateTeamRolloutModal.component.module.scss';

interface Props {
    deps: Deps;
    appId: number;
    isValidVersionNumber: (versionNumber: number) => Promise<boolean>;
    onCreateRolloutClick: (rollout: CreateAppRolloutInput) => void;
    createActivator: (input: CreateActivatorInput) => Promise<number>;
    createVersionSelector: (
        input: CreateVersionSelectorInput,
    ) => Promise<number>;
}

export class CreateTeamRolloutModalComponent extends Component<Props> {
    private readonly modalRef: RefObject<ModalUI> = createRef();

    render() {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Create Team Rollout
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <CreateRolloutViewComponent
                        relativeLayout={this.props.deps.relativeLayout}
                        groupLabel={'Team'}
                        appRolloutType='TEAM'
                        renderInlineGroup={this.renderInlineTeamGroup}
                        isValidGroup={this.isValidTeamGroup}
                        isValidVersionNumber={this.props.isValidVersionNumber}
                        onCreateRolloutClick={this.handleCreateRolloutClick}
                        createActivator={this.props.createActivator}
                        createVersionSelector={this.props.createVersionSelector}
                    />
                </div>
            </ModalUI>
        );
    }

    open() {
        this.modalRef.current?.open();
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private renderInlineTeamGroup = (groupId: number) => {
        const app = this.props.deps.graphSource.app(this.props.appId);
        const group = app?.teamGroups.find((group) => group.id === groupId);
        if (!group) {
            return null;
        }

        return <div className={styles.InlineGroup}>{group.name}</div>;
    };

    private isValidTeamGroup = async (groupId: number): Promise<boolean> => {
        const app = this.props.deps.graphSource.app(this.props.appId);
        return app?.teamGroups.some((group) => group.id === groupId) || false;
    };

    private handleCreateRolloutClick = (rollout: CreateAppRolloutInput) => {
        this.props.onCreateRolloutClick(rollout);
        this.modalRef.current?.close();
    };
}
