import React, { Component, ReactElement } from 'react';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import styles from './Assignee.component.module.scss';

interface IProps {}

export default class AssigneeComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <div className={styles.Assignee}>
                <div className={styles.Profile}>
                    <MaterialIconComponent>face</MaterialIconComponent>
                </div>
            </div>
        );
    }
}
