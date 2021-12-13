import React, { Component, ReactElement } from 'react';
import { User } from '../../entity/User';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import styles from './SelectUserList.component.module.scss';
import { UserProfile } from './UserProfile.component';

interface IProps {
    users: User[];
    selectedUserId?: number;
    onSelectUser?: (userId: number) => void;
}

export class SelectUserListComponent extends Component<IProps> {
    render(): ReactElement {
        return (
            <div className={styles.SelectUserList}>
                {this.props.users.map(this.renderUser)}
            </div>
        );
    }

    public renderUser = (user: User, index: number): ReactElement => {
        const name = `${user.firstName} ${
            user.lastName && `${user.lastName![0].toUpperCase()}.`
        }`;
        return (
            <div
                className={styles.UserRow}
                key={index}
                onClick={this.onUserRowClick(user.id)}
            >
                <div className={styles.SelectionIndicator}>
                    {this.props.selectedUserId === user.id && (
                        <MaterialIconComponent>check</MaterialIconComponent>
                    )}
                </div>
                <UserProfile user={user} />
                <div className={styles.Name}>{name}</div>
            </div>
        );
    };

    private onUserRowClick = (userId: number): (() => void) => {
        return () => {
            this.props.onSelectUser?.call(null, userId);
        };
    };
}
