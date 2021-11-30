import classNames from 'classnames';
import React, { Component, ReactElement } from 'react';
import styles from './Modal.component.module.scss';

const transitionDurationMilliseconds = 400;

interface IState {
    isVisible: boolean;
    isOpen: boolean;
    isAnimating: boolean;
}

export default class ModalComponent extends Component<any, IState> {
    constructor(props: any) {
        super(props);
        this.state = {
            isVisible: false,
            isOpen: false,
            isAnimating: false,
        };
    }

    public render(): ReactElement {
        return (
            <div className={styles.Modal}>
                {this.state.isVisible && (
                    <div>
                        <div
                            className={`${styles.Content} ${classNames({
                                [styles.Show]: this.state.isOpen,
                            })}`}
                            style={{
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
