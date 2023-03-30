import React, { Component } from 'react';

import styles from './Button.module.scss';

interface Props {
    label: string;
    onClick?: () => void;
}

export class ButtonUI extends Component<Props> {
    render() {
        return (
            <div
                role={'button'}
                aria-label={this.props.label}
                className={styles.Button}
                onClick={this.props.onClick}
            >
                {this.props.label}
            </div>
        );
    }
}
