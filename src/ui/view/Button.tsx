import React, { Component } from 'react';
import styles from './Button.module.scss';

interface IProps {
    label: string;
    onClick?: () => void;
}

export class Button extends Component<IProps> {
    render() {
        return (
            <div className={styles.Button} onClick={this.props.onClick}>
                {this.props.label}
            </div>
        );
    }
}
