import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { CreateActivatorInput, CreateAppRolloutInput, CreateVersionSelectorInput } from '@core/entity/input';

import { CreateRolloutViewComponent } from './CreateRolloutView.component';
import styles from './CreateUserRolloutModal.component.module.scss';
import { Deps } from '@core/dep/deps';

interface Props {
    deps: Deps;
    appId: number
    isValidVersionNumber: (versionNumber: number) => boolean;
    onCreateRolloutClick: (rollout: CreateAppRolloutInput) => void;
    createActivator: (input: CreateActivatorInput) => Promise<number>;
    createVersionSelector: (input: CreateVersionSelectorInput) => Promise<number>;
}

export class CreateUserRolloutModalComponent extends Component<Props> {
    private readonly modalRef: RefObject<ModalUI> = createRef();

    render() {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Create User Rollout
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.close}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <CreateRolloutViewComponent
                        groupLabel={'User'}
                        appRolloutType='USER'
                        renderInlineGroup={this.renderInlineUserGroup}
                        isValidGroup={this.isValidUserGroup}
                        isValidVersionNumber={this.props.isValidVersionNumber}
                        onCreateRolloutClick={this.props.onCreateRolloutClick}
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

    private renderInlineUserGroup = (groupId: number): ReactNode => {
        const app = this.props.deps.graphSource.app(this.props.appId);
        if (!app) {
            return null;
        }

        const group = app.userGroups.find((group) => group.id === groupId);
        if (!group) {
            return null;
        }

        return <div className={styles.InlineGroup}>{group.name}</div>;
    };

    private isValidUserGroup = (groupId: number): boolean => {
        const app = this.props.deps.graphSource.app(this.props.appId);
        if (!app) {
            return false;
        }
        
        return app.userGroups.some((group) => group.id === groupId);
    };

}
