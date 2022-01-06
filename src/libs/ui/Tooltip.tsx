import classNames from 'classnames';
import React, { Component, ReactElement, createRef } from 'react';

import styles from './Tooltip.module.scss';

const minHoverMilliseconds = 500;

interface Props {
    message: string;
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
    private timer?: ReturnType<typeof setTimeout>;

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

    private onComponentMouseEnter = () => {
        this.timer = setTimeout(() => {
            this.setState({
                showTooltip: true,
            });
            this.componentRef.current?.focus();

            setTimeout(() => {
                const component = this.componentRef.current;
                if (!component) {
                    return;
                }

                const rect = component.getBoundingClientRect();
                const componentLeft = rect.left;
                const componentTop = rect.top;
                const componentWidth = rect.width;
                const componentHeight = rect.height;
                const tooltipWidth = this.tooltipRef.current?.offsetWidth || 0;
                const tooltipLeft =
                    componentLeft + componentWidth / 2 - tooltipWidth / 2;
                const tooltipTop = componentTop + componentHeight;

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
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }

        this.setState({
            showTooltip: false,
            tooltipVisible: false,
        });
    }
}
