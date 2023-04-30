import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { Point } from '@lib/ui/position';

import styles from './Tooltip.module.scss';

const minHoverMilliseconds = 500;

type Position = 'Top' | 'Bottom' | 'Left' | 'Right';

interface Props {
    children: ReactNode;
    message: string;
    position?: Position;
    parentOffset?: Point;
    disabled?: boolean;
}

interface State {
    showTooltip: boolean;
    tooltipVisible: boolean;
    tooltipTop: number;
    tooltipLeft: number;
    tooltipPosition: Position;
    tooltipTriangleTop?: number;
    tooltipTriangleLeft?: number;
}

export class TooltipUI extends Component<Props, State> {
    private componentRef = createRef<HTMLDivElement>();
    private tooltipRef = createRef<HTMLDivElement>();
    private outerTimer?: any;
    private innerTimer?: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            showTooltip: false,
            tooltipVisible: false,
            tooltipTop: 0,
            tooltipLeft: 0,
            tooltipPosition: this.props.position || 'Bottom',
        };
    }

    render(): ReactNode {
        if (this.props.disabled) {
            return this.props.children;
        }

        return (
            <div className={styles.Box}>
                <div
                    ref={this.componentRef}
                    tabIndex={-1}
                    className={styles.Component}
                    onMouseEnter={this.onComponentMouseEnter}
                    onMouseLeave={this.onComponentMouseLeave}
                    onBlur={this.onComponentBlur}
                >
                    {this.props.children}
                </div>
                <div
                    role={'tooltip'}
                    aria-label={this.props.message}
                    ref={this.tooltipRef}
                    className={`${styles.Tooltip} ${classNames({
                        [styles.Show]: this.state.showTooltip,
                        [styles.Top]: this.state.tooltipPosition === 'Top',
                        [styles.Right]: this.state.tooltipPosition === 'Right',
                        [styles.Bottom]:
                            this.state.tooltipPosition === 'Bottom',
                        [styles.Left]: this.state.tooltipPosition === 'Left',
                    })}`}
                    style={{
                        top: this.state.tooltipTop,
                        left: this.state.tooltipLeft,
                        visibility: this.state.tooltipVisible
                            ? 'visible'
                            : 'hidden',
                    }}
                >
                    <div
                        className={styles.Triangle}
                        style={{
                            top: this.state.tooltipTriangleTop,
                            left: this.state.tooltipTriangleLeft,
                        }}
                    />
                    {this.props.message}
                </div>
            </div>
        );
    }

    public componentWillUnmount() {
        this.dispose();
    }

    private onComponentMouseEnter = () => {
        this.outerTimer = setTimeout(() => {
            this.setState({
                showTooltip: true,
            });
            this.componentRef.current?.focus();

            this.innerTimer = setTimeout(() => {
                const component = this.componentRef.current;
                if (!component) {
                    return;
                }

                const {
                    tooltipLeft,
                    tooltipTop,
                    position,
                    tooltipTriangleLeft,
                    tooltipTriangleTop,
                } = this.getPosition(
                    this.componentRef.current!,
                    this.props.position,
                );
                this.setState({
                    tooltipVisible: true,
                    tooltipTop,
                    tooltipLeft,
                    tooltipPosition: position || 'Bottom',
                    tooltipTriangleLeft,
                    tooltipTriangleTop,
                });
            });
        }, minHoverMilliseconds);
    };

    private onComponentMouseLeave = () => {
        this.hideTooltip();
    };

    private onComponentBlur = () => {
        this.hideTooltip();
    };

    private hideTooltip() {
        this.setState({
            showTooltip: false,
            tooltipVisible: false,
        });

        this.dispose();
    }

    private getPosition(
        component: HTMLDivElement,
        position?: Position,
    ): {
        tooltipLeft: number;
        tooltipTop: number;
        position?: Position;
        tooltipTriangleTop?: number;
        tooltipTriangleLeft?: number;
    } {
        const rect = component.getBoundingClientRect();
        const componentLeft = rect.left - (this.props.parentOffset?.left || 0);
        const componentTop = rect.top - (this.props.parentOffset?.top || 0);
        const componentWidth = rect.width;
        const componentHeight = rect.height;
        const tooltipWidth = this.tooltipRef.current?.offsetWidth || 0;
        const tooltipHeight = this.tooltipRef.current?.offsetHeight || 0;

        let tooltipLeft = 0;
        let tooltipTop = 0;
        let tooltipTriangleTop;
        let tooltipTriangleLeft;

        switch (position) {
            case 'Top': {
                if (componentTop - tooltipHeight < 0) {
                    return this.getPosition(component, 'Bottom');
                }

                tooltipTop = componentTop - tooltipHeight;
                break; 
            }
            case 'Left': {
                if (componentLeft - tooltipWidth < 0) {
                    return this.getPosition(component, 'Right');
                }

                tooltipLeft = componentLeft - tooltipWidth;
                break;
            }
            case 'Right': {
                if (
                    componentLeft + componentWidth + tooltipWidth >
                    window.innerWidth
                ) {
                    return this.getPosition(component, 'Left');
                }

                tooltipLeft = componentLeft + componentWidth;
                break;
            }
            default: {
                if (
                    componentTop + componentHeight + tooltipHeight >
                    window.innerHeight
                ) {
                    return this.getPosition(component, 'Top');
                }

                tooltipTop = componentTop + componentHeight;
                break;
            }
        }

        if (!position || position === 'Top' || position === 'Bottom') {
            if (componentLeft + componentWidth / 2 - tooltipWidth / 2 >= 0) {
                tooltipLeft =
                    componentLeft + componentWidth / 2 - tooltipWidth / 2;
                tooltipTriangleLeft = tooltipWidth / 2 - 6;
            } else {
                tooltipLeft = 0;
                tooltipTriangleLeft = componentLeft + componentWidth / 2 - 6;
            }
        } else {
            if (componentTop + componentHeight / 2 - tooltipHeight / 2 >= 0) {
                tooltipTop =
                    componentTop + componentHeight / 2 - tooltipHeight / 2;
                tooltipTriangleTop = tooltipHeight / 2 - 6;
            } else {
                tooltipTop = 0;
                tooltipTriangleTop = componentTop + componentHeight / 2 - 6;
            }
        }
        
        return {
            tooltipLeft,
            tooltipTop,
            position,
            tooltipTriangleTop,
            tooltipTriangleLeft,
        };
    }

    private dispose() {
        if (this.outerTimer) {
            clearTimeout(this.outerTimer);
            this.outerTimer = undefined;
        }

        if (this.innerTimer) {
            clearTimeout(this.innerTimer);
            this.innerTimer = undefined;
        }
    }
}
