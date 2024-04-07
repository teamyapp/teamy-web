import React, { Component, ReactNode } from 'react';

import styles from './MaterialIcon.module.scss';

type IconStyle = 'outlined' | 'rounded' | 'sharp';

interface Props {
    children: React.ReactNode;
    iconStyle?: IconStyle;
    rotatedDegree?: number;
}

export class MaterialIconUI extends Component<Props> {
    public render(): ReactNode {
        const iconStyle = this.props.iconStyle || 'outlined';
        return (
            <i
                role={'figure'}
                className={`${styles.Icon} ${
                    styles[`material-symbols-${iconStyle}`]
                }`}
                style={{
                    transform: `rotate(${this.props.rotatedDegree || 0}deg)`,
                }}
            >
                <span className={styles.Content}>{this.props.children}</span>
            </i>
        );
    }
}
