import React, { Component } from 'react';

import styles from './Button.module.scss';

interface IProps {
    label: string;
    disabled?: boolean;
    onClick?: () => void;
}

export class ButtonUI extends Component<IProps> {
    render() {
        return (
            <div className={styles.Button} onClick={!this.props.disabled ? this.props.onClick : undefined}>
                {this.props.label}
            </div>
        );
    }
}
