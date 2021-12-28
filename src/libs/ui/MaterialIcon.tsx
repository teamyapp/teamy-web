import React, { Component, ReactElement } from 'react';

import styles from './MaterialIcon.module.scss';

export class MaterialIconUI extends Component {
    public render(): ReactElement {
        return (
            <i className={styles.Icon}>
                <span className={styles.Content}>{this.props.children}</span>
            </i>
        );
    }
}
