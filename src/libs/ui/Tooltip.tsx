import classNames from 'classnames';
import React, { Component, ReactElement, createRef } from 'react';

import { Point } from '@lib/ui/position';

import styles from './Tooltip.module.scss';

const minHoverMilliseconds = 500;

type Position = 'Top' | 'Bottom' | 'Left' | 'Right';

interface Props {
    message: string;
    position?: Position;
    parentOffset?: Point;
}

interface State {
    showTooltip: boolean;
    tooltipVisible: boolean;
    tooltipTop: number;
    tooltipLeft: number;
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
        };
    }

    render(): ReactElement {
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
                    ref={this.tooltipRef}
                    className={`${styles.Tooltip} ${classNames({
                        [styles.Show]: this.state.showTooltip,
                        [styles.Top]: this.props.position === 'Top',
                        [styles.Right]: this.props.position === 'Right',
                        [styles.Bottom]:
                            !this.props.position ||
                            this.props.position === 'Bottom',
                        [styles.Left]: this.props.position === 'Left',
                    })}`}
                    style={{
                        top: this.state.tooltipTop,
                        left: this.state.tooltipLeft,
                        visibility: this.state.tooltipVisible
                            ? 'visible'
                            : 'hidden',
                    }}
                >
                    <div className={styles.Triangle} />
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

                const { tooltipLeft, tooltipTop } = this.getPosition(
                    this.componentRef.current!,
                );
                this.setState({
                    tooltipVisible: true,
                    tooltipTop,
                    tooltipLeft,
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

    private getPosition(component: HTMLDivElement) {
        const rect = component.getBoundingClientRect();
        const componentLeft = rect.left - (this.props.parentOffset?.left || 0);
        const componentTop = rect.top - (this.props.parentOffset?.top || 0);
        const componentWidth = rect.width;
        const componentHeight = rect.height;
        const tooltipWidth = this.tooltipRef.current?.offsetWidth || 0;
        const tooltipHeight = this.tooltipRef.current?.offsetHeight || 0;

        let tooltipLeft;
        let tooltipTop;

        switch (this.props.position) {
            case 'Top': {
                tooltipLeft =
                    componentLeft + componentWidth / 2 - tooltipWidth / 2;
                tooltipTop = componentTop - tooltipHeight;
                break;
            }
            case 'Left': {
                tooltipLeft = componentLeft - tooltipWidth;
                tooltipTop =
                    componentTop + componentHeight / 2 - tooltipHeight / 2;
                break;
            }
            case 'Right': {
                tooltipLeft = componentLeft + componentWidth;
                tooltipTop =
                    componentTop + componentHeight / 2 - tooltipHeight / 2;
                break;
            }
            default: {
                tooltipLeft =
                    componentLeft + componentWidth / 2 - tooltipWidth / 2;
                tooltipTop = componentTop + componentHeight;
                break;
            }
        }

        return {
            tooltipLeft,
            tooltipTop,
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
