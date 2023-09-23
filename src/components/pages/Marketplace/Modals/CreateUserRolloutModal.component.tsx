import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Group } from '@core/entity/group';
import { CreateAppRolloutInput } from '@core/entity/input';
import { User } from '@core/entity/user';

import { CreateRolloutViewComponent } from './CreateRolloutView.component';
import styles from './CreateUserRolloutModal.component.module.scss';

const userGroups: Group<User>[] = [
    {
        id: 1,
        type: 'static',
        name: 'Beta testers',
        members: [
            {
                id: 1,
                firstName: 'Harry',
                lastName: 'Liu',
                fullName: 'Harry Liu',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/23133',
                teams: [],
                linkedUsers: [],
            },
            {
                id: 2,
                firstName: 'Xianbo',
                lastName: 'Duan',
                fullName: 'Xianbo Duan',
                profileUrl:
                    'https://cloud.staging.teamyapp.com/file/files/21532',
                teams: [],
                linkedUsers: [],
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
        name: 'US Teenager',
        filter: '(country=US) and (age>18) and (age<26)',
        createdAt: new Date(),
        rollouts: [],
    },
];

interface Props {}

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
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <CreateRolloutViewComponent
                        groupLabel={'User'}
                        renderInlineGroup={this.renderInlineUserGroup}
                        isValidGroup={this.isValidUserGroup}
                        onCreateClick={this.onRolloutCreateClick}
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
        const group = userGroups.find((group) => group.id === groupId);
        if (!group) {
            return null;
        }

        return <div className={styles.InlineGroup}>{group.name}</div>;
    };

    private isValidUserGroup = (groupId: number): boolean => {
        return userGroups.some((group) => group.id === groupId);
    };

    private onRolloutCreateClick = (rollout: CreateAppRolloutInput) => {};
}
