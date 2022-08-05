import React, { Component, ReactNode } from 'react';

import styles from './Section.module.scss';

interface Props {
    children: ReactNode;
    title: string;
    actions?: ReactNode;
}

export class SectionUI extends Component<Props> {
    public render(): ReactNode {
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
