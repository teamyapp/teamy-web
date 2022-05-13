import React, { Component, ReactNode } from 'react';

import styles from './NamedValue.module.scss';

interface IProps {
    name: string;
    value: string;
}

export class NamedValueUI extends Component<IProps> {
    public render(): ReactNode {
        return (
            <div className={styles.NamedValue}>
                <div className={styles.Name}>{this.props.name}</div>
                <div className={styles.Value}>{this.props.value}</div>
            </div>
        );
    }
}
