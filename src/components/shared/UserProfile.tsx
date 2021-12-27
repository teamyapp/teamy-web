import React, { Component, ReactElement } from 'react';
import { User } from '../../entity/user';
import styles from './UserProfile.module.scss';

interface IProps {
    user: User;
}

export class UserProfileUI extends Component<IProps> {
    public render(): ReactElement {
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
