import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { CreateGroupViewComponent } from './CreateGroupView.component';
import styles from './CreateTeamGroupModal.component.module.scss';

interface Props {
    deps: Deps;
    appId: number;
    onCreateStaticGroupClick?: (
        groupName: string,
        userIds: number[],
        rolloutIds: number[],
    ) => void;
    onCreateFilterGroupClick?: (
        groupName: string,
        filter: string,
        rolloutIds: number[],
    ) => void;
}

export class CreateTeamGroupModalComponent extends Component<Props> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly appNameInputRef: RefObject<TextFieldUI> = createRef();

    private graphSource: GraphSource;
    private stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
    }

    render() {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Create Team Group
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
                    <CreateGroupViewComponent
                        membersLabel={'Teams'}
                        memberLabel={'Team'}
                        renderInlineGroupMember={this.renderInlineTeam}
                        isValidMember={this.isValidTeam}
                        onCreateStaticGroup={this.onCreateStaticGroupClick}
                        onCreateFilterGroup={this.onCreateFilterGroupClick}
                    />
                </div>
            </ModalUI>
        );
    }

    open() {
        this.modalRef.current?.open();
        setTimeout(() => {
            this.appNameInputRef.current?.focus();
        });
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private renderInlineTeam = (teamId: number): ReactNode => {
        // TODO: pull team
        let team = this.graphSource.team(teamId);
        return (
            team && (
                <div className={styles.InlineTeam}>
                    <div className={styles.Icon}>
                        {team.iconUrl ? (
                            <img src={team.iconUrl} alt={team.name} />
                        ) : (
                            <div className={styles.IconDefault}>
                                {team.name[0].toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className={styles.Name}>{team.name}</div>
                </div>
            )
        );
    };

    private isValidTeam = async (teamId: number): Promise<boolean> => {
        await this.stateSyncer.pullTeam(teamId)
        return Boolean(this.graphSource.team(teamId));
    };

    private onCreateStaticGroupClick = async (
        groupName: string,
        userIds: number[],
    ) => {
        await this.stateSyncer.createStaticTeamGroup(this.props.appId, {
            groupName,
            memberIds: userIds,
            rolloutIds: [],
        });
        this.modalRef.current?.close();
    };

    private onCreateFilterGroupClick = async (
        groupName: string,
        filter: string,
    ) => {
        await this.stateSyncer.createFilterGroup(this.props.appId, {
            groupName,
            filter,
            groupMemberType: 'TEAM',
            rolloutIds: [],
        });
        this.modalRef.current?.close();
    };
}
