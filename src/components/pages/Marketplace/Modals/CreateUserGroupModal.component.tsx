import React, { Component, ReactNode, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { UserProfileUI } from '../../../internal/UserProfile';
import { getUserShortName } from '../../../internal/format';
import { CreateGroupViewComponent } from './CreateGroupView.component';
import styles from './CreateUserGroupModal.component.module.scss';

interface Props {
    deps: Deps;
    appId: number;
    onCreateStaticGroupClick?: (groupName: string, userIds: number[]) => void;
    onCreateFilterGroupClick?: (groupName: string, filter: string) => void;
}

export class CreateUserGroupModalComponent extends Component<Props> {
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
                    Create User Group
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
                        membersLabel={'Users'}
                        memberLabel={'User'}
                        renderInlineGroupMember={this.renderInlineUser}
                        isValidMember={this.isValidUser}
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

    private renderInlineUser = (userId: number): ReactNode => {
        // TODO: pull user
        let user = this.graphSource.user(userId);
        return (
            user && (
                <div className={styles.InlineUser}>
                    <div className={styles.Profile}>
                        <UserProfileUI user={user} />
                    </div>
                    <div className={styles.Name}>
                        {getUserShortName(user.firstName, user.lastName)}
                    </div>
                </div>
            )
        );
    };

    private isValidUser = (userId: number): boolean => {
        // TODO: pull user
        return this.graphSource.user(userId) !== undefined;
    };

    private onCreateStaticGroupClick = async (
        groupName: string,
        userIds: number[],
    ) => {
        await this.stateSyncer.createStaticUserGroup(this.props.appId, {
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
            groupMemberType: 'USER',
            rolloutIds: [],
        });
        this.modalRef.current?.close();
    };
}
