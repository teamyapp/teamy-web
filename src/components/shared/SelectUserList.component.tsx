import React, { Component, ReactElement } from 'react';
import { User } from '../../entity/User';
import styles from './SelectUserList.component.module.scss';
import { UserProfile } from './UserProfile.component';

interface IProps {
    users: User[];
    onSelectUser?: (userId: number) => void;
    findUsers?: () => void;
}

export class SelectUserListComponent extends Component<IProps> {
    render(): ReactElement {
        return (
            <div className={styles.SelectUserList}>
                {this.props.users.map(this.renderUser)}
            </div>
        );
    }

    public componentDidMount() {
        this.props.findUsers?.call(null);
    }

    public renderUser = (user: User, index: number): ReactElement => {
        const name = `${user.firstName} ${user.lastName![0].toUpperCase()}`;
        return (
            <div
                className={styles.UserRow}
                key={index}
                onClick={this.onUserRowClick(user.id)}
            >
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
