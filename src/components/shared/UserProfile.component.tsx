import React, { Component, ReactElement } from 'react';
import { User } from '../../entity/User';
import styles from './UserProfile.component.module.scss';

interface IProps {
    user: User;
}

export class UserProfile extends Component<IProps> {
    public render(): ReactElement {
        const name = `${
            this.props.user.firstName
        } ${this.props.user.lastName![0].toUpperCase()}`;
        return (
            <img
                className={styles.UserProfile}
                src={this.props.user.profileUrl}
                alt={name}
            />
        );
    }
}
