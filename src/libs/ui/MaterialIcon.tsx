import React, { Component, ReactNode } from 'react';

import styles from './MaterialIcon.module.scss';

type IconStyle = 'outlined' | 'rounded' | 'sharp';

interface Props {
    children: React.ReactNode;
    iconStyle?: IconStyle;
    color?: string;
}

export class MaterialIconUI extends Component<Props> {
    public render(): ReactNode {
        const iconStyle = this.props.iconStyle || 'outlined';
        return (
            <i
                className={`${styles.Icon} ${
                    styles[`material-symbols-${iconStyle}`]
                }`}
                style={{
                    color: this.props.color,
                }}
            >
                <span className={styles.Content}>{this.props.children}</span>
            </i>
        );
    }
}
