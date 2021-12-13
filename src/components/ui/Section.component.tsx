import React, { Component, ReactElement } from 'react';

import styles from './Section.component.module.scss';

interface IProps {
    title: string;
    actions?: ReactElement;
}

export default class SectionComponent extends Component<IProps> {
    public render(): ReactElement {
        return (
            <section className={styles.Section}>
                <div className={styles.Header}>
                    <div>{this.props.title}</div>
                    <div className={styles.Actions}>{this.props.actions}</div>
                </div>
                <div className={styles.Content}>{this.props.children}</div>
            </section>
        );
    }
}
