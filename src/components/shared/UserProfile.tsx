import React, { Component, ReactNode } from 'react';

import { User } from '@core/entity/user';

import styles from './UserProfile.module.scss';

interface Props {
    user: User;
}

export class UserProfileUI extends Component<Props> {
    public render(): ReactNode {
        const name = `${this.props.user.firstName} ${
            this.props.user.lastName
                ? this.props.user.lastName[0].toUpperCase()
                : ''
        }`;

        return this.props.user.profileUrl ? (
            <img
                className={styles.UserProfile}
                src={this.props.user.profileUrl}
                alt={name}
            />
        ) : (
            <div className={styles.UserProfile}>
                {this.props.user.firstName ? this.props.user.firstName[0] : '?'}
            </div>
        );
    }
}
