import React, { Component, ReactElement } from 'react';
import { User } from '../../entity/User';
import { MaterialIconUI } from '../../ui/view/MaterialIcon';
import styles from './SelectUserList.module.scss';
import { UserProfileUI } from './UserProfile';

interface IProps {
    users: User[];
    selectedUserId?: number;
    onSelectUser?: (userId: number) => void;
}

export class SelectUserListUI extends Component<IProps> {
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
                        <MaterialIconUI>check</MaterialIconUI>
                    )}
                </div>
                <UserProfileUI user={user} />
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
