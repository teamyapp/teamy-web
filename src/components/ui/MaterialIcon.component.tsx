import { Component, ReactElement } from 'react';

import styles from './MaterialIcon.component.module.scss';

export default class MaterialIconComponent extends Component {
    public render(): ReactElement {
        return (
            <i className={styles.Icon}>
                <span className={styles.Content}>{this.props.children}</span>
            </i>
        );
    }
}
