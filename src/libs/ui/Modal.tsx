import classNames from 'classnames';
import React, { Component, Fragment, ReactNode, createRef } from 'react';

import { Point } from '@lib/ui/position';

import styles from './Modal.module.scss';

const transitionDurationMilliseconds = 400;
const baseElevation = 1000;

interface Props {
    level?: number;
    onClose?: () => void;
}

interface State {
    isVisible: boolean;
    isOpen: boolean;
    isAnimating: boolean;
}

export class ModalUI extends Component<Props, State> {
    private readonly contentRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            isVisible: false,
            isOpen: false,
            isAnimating: false,
        };
    }

    public render(): ReactNode {
        const elevation = (this.props.level || 0) + baseElevation;
        return (
            <div className={styles.Modal}>
                {this.state.isVisible && (
                    <Fragment>
                        <div
                            ref={this.contentRef}
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
                    </Fragment>
                )}
            </div>
        );
    }

    public open(): void {
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

    public close(): void {
        if (this.state.isAnimating) {
            return;
        }

        this.setState({
            isOpen: false,
            isAnimating: true,
        });
        this.props.onClose?.call(null);

        setTimeout(() => {
            this.setState({
                isVisible: false,
                isAnimating: false,
            });
        }, transitionDurationMilliseconds);
    }

    public Position(): Point {
        const rect = this.contentRef.current?.getBoundingClientRect();
        if (rect) {
            return {
                left: rect.left,
                top: rect.top,
            };
        } else {
            return {
                left: 0,
                top: 0,
            };
        }
    }

    private onOverlayClick = () => {
        this.close();
    };
}
