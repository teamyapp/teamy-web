import classNames from 'classnames';
import React, { Component, ReactElement } from 'react';

import styles from './Modal.module.scss';

const transitionDurationMilliseconds = 400;
const baseElevation = 1000;

interface IProps {
    level?: number;
}

interface IState {
    isVisible: boolean;
    isOpen: boolean;
    isAnimating: boolean;
}

export class ModalUI extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            isVisible: false,
            isOpen: false,
            isAnimating: false,
        };
    }

    public render(): ReactElement {
        const elevation = (this.props.level || 0) + baseElevation;
        return (
            <div className={styles.Modal}>
                {this.state.isVisible && (
                    <div>
                        <div
                            className={`${styles.Content} ${classNames({
                                [styles.Show]: this.state.isOpen,
                            })}`}
                            style={{
                                zIndex: elevation + 1,
                                transitionDuration: `${transitionDurationMilliseconds}ms`,
                            }}
                        >
                            {this.props.children}
                        </div>
                        <div
                            className={`${styles.Overlay} ${classNames({
                                [styles.Show]: this.state.isOpen,
                            })}`}
                            style={{
                                zIndex: elevation,
                                transitionDuration: `${transitionDurationMilliseconds}ms`,
                            }}
                            onClick={this.onOverlayClick}
                        />
                    </div>
                )}
            </div>
        );
    }

    open(): void {
        if (this.state.isAnimating) {
            return;
        }

        this.setState({
            isVisible: true,
        });
        setTimeout(() => {
            this.setState({
                isOpen: true,
                isAnimating: true,
            });
        });
        setTimeout(() => {
            this.setState({
                isAnimating: false,
            });
        }, transitionDurationMilliseconds);
    }

    close(): void {
        if (this.state.isAnimating) {
            return;
        }

        this.setState({
            isOpen: false,
            isAnimating: true,
        });

        setTimeout(() => {
            this.setState({
                isVisible: false,
                isAnimating: false,
            });
        }, transitionDurationMilliseconds);
    }

    onOverlayClick = () => {
        this.close();
    };
}
