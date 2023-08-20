import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { Point } from '@lib/ui/position';

import styles from './Modal.module.scss';

const transitionDurationMilliseconds = 400;
const baseElevation = 1000;

interface Props {
    children?: React.ReactNode;
    level?: number;
    ariaLabel?: string;
    disableClose?: boolean;
    onClose?: () => void;
}

interface State {
    isVisible: boolean;
    isOpen: boolean;
    isAnimating: boolean;
    fullyOpened: boolean;
    fullyClosed: boolean;
}

export class ModalUI extends Component<Props, State> {
    private readonly contentRef = createRef<HTMLDivElement>();

    constructor(props: Props) {
        super(props);
        this.state = {
            isVisible: false,
            isOpen: false,
            isAnimating: false,
            fullyOpened: false,
            fullyClosed: true,
        };
    }

    public render(): ReactNode {
        const elevation = (this.props.level || 0) + baseElevation;
        return (
            <div
                role={'dialog'}
                aria-label={this.props.ariaLabel}
                aria-modal='true'
                data-fully-opened={this.state.fullyOpened}
                data-fully-closed={this.state.fullyOpened}
                className={styles.Modal}
            >
                {this.state.isVisible && (
                    <>
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
                    </>
                )}
            </div>
        );
    }

    public open(): void {
        if (this.state.isAnimating) {
            return;
        }

        this.setState({
            fullyClosed: false,
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
                fullyOpened: true,
            });
        }, transitionDurationMilliseconds);
    }

    public close(): void {
        if (this.state.isAnimating) {
            return;
        }

        this.setState({
            isOpen: false,
            fullyClosed: false,
            isAnimating: true,
        });
        this.props.onClose?.call(null);

        setTimeout(() => {
            this.setState({
                isVisible: false,
                isAnimating: false,
                fullyClosed: true,
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
        if (this.props.disableClose) {
            return;
        }

        this.close();
    };
}
