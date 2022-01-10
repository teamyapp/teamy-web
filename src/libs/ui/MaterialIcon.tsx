import React, { Component, ReactElement } from 'react';

import styles from './MaterialIcon.module.scss';

type IconStyle = undefined | 'outline' | 'round' | 'sharp';

interface Props {
    iconStyle?: IconStyle;
}

export class MaterialIconUI extends Component<Props> {
    public render(): ReactElement {
        return (
            <i
                className={styles.Icon}
                style={{
                    fontFamily: `${materialFont(
                        this.props.iconStyle,
                    )}, sans-serif`,
                }}
            >
                <span className={styles.Content}>{this.props.children}</span>
            </i>
        );
    }
}

function materialFont(iconStyle: IconStyle) {
    switch (iconStyle) {
        case undefined:
            return 'Material Icons';
        case 'outline':
            return 'Material Icons Outlined';
        case 'round':
            return 'Material Icons Round';
        case 'sharp':
            return 'Material Icons Sharp';
    }
}
