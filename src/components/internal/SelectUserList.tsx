import React, { Component, ReactNode } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { User } from '@core/entity/user';
import { FormatService } from '@core/service/format.service';

import styles from './SelectUserList.module.scss';
import { UserProfileUI } from './UserProfile';

interface Props {
    emptySelectionUserName: string;
    users: User[];
    selectedUserId?: number;
    onSelectUser?: (userId: number) => void;
    onRemoveSelection?: () => void;
}

export class SelectUserListUI extends Component<Props> {
    render(): ReactNode {
        return (
            <div className={styles.SelectUserList}>
                {this.renderEmptySelection()}
                {this.props.users.map(this.renderUser)}
            </div>
        );
    }

    public renderUser = (user: User, index: number): ReactNode => {
        return (
            <div
                className={styles.UserRow}
                key={index}
                onClick={this.onUserRowClick(user.id)}
            >
                <div className={styles.SelectionIndicator}>
                    {this.props.selectedUserId === user.id && (
                        <MaterialIconUI>check</MaterialIconUI>
                    )}
                </div>
                <UserProfileUI user={user} />
                <div className={styles.Name}>
                    {FormatService.getShortName(user.firstName, user.lastName)}
                </div>
            </div>
        );
    };

    private renderEmptySelection() {
        return (
            <div
                className={styles.UserRow}
                onClick={this.props.onRemoveSelection}
            >
                <div className={styles.SelectionIndicator}>
                    {this.props.selectedUserId === undefined && (
                        <MaterialIconUI>check</MaterialIconUI>
                    )}
                </div>
                <div className={styles.EmptySelectionFace}>
                    <MaterialIconUI>face</MaterialIconUI>
                </div>
                <div className={styles.Name}>
                    {this.props.emptySelectionUserName}
                </div>
            </div>
        );
    }

    private onUserRowClick = (userId: number): (() => void) => {
        return () => {
            this.props.onSelectUser?.call(null, userId);
        };
    };
}
