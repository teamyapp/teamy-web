import React, { Component, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Group } from '@core/entity/group';
import { CreateAppRolloutInput } from '@core/entity/input';
import { Team } from '@core/entity/team';

import { CreateRolloutViewComponent } from './CreateRolloutView.component';
import styles from './CreateTeamRolloutModal.component.module.scss';

const teamGroups: Group<Team>[] = [
    {
        id: 1,
        type: 'static',
        name: '1st party partners',
        members: [
            {
                id: 1,
                name: 'Teamy',
                iconUrl: 'https://cloud.staging.teamyapp.com/file/files/3469',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
            {
                id: 2,
                name: 'Test',
                iconUrl: '',
                creator: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
                owner: {
                    id: 1,
                    firstName: 'Harry',
                    lastName: 'Liu',
                    fullName: 'Harry Liu',
                    profileUrl:
                        'https://cloud.staging.teamyapp.com/file/files/23133',
                    teams: [],
                    linkedUsers: [],
                },
            },
        ],
        createdAt: new Date(),
        rollouts: [],
    },
    {
        id: 2,
        type: 'filter',
        name: 'US Massachusetts',
        filter: '(country=US) AND (state=MA)',
        createdAt: new Date(),
        rollouts: [],
    },
];

interface Props {
    isValidVersionNumber: (versionNumber: number) => boolean;
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
                        groupLabel={'Team'}
                        renderInlineGroup={this.renderInlineTeamGroup}
                        isValidGroup={this.isValidTeamGroup}
                        isValidVersionNumber={this.props.isValidVersionNumber}
                        onCreateClick={this.onCreateRolloutClick}
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
        const group = teamGroups.find((group) => group.id === groupId);
        if (!group) {
            return null;
        }

        return <div className={styles.InlineGroup}>{group.name}</div>;
    };

    private isValidTeamGroup = (groupId: number): boolean => {
        return teamGroups.some((group) => group.id === groupId);
    };

    private onCreateRolloutClick = (rollout: CreateAppRolloutInput) => {};
}
