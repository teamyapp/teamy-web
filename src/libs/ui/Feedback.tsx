import classNames from 'classnames';
import React, { Component, ReactNode } from 'react';

import styles from './Feedback.module.scss';

const transitionDurationMilliseconds = 200;
const visibleDurationSeconds = 5;

interface Props {
    children: ReactNode;
    actionLabel?: string;
    onActionClick?: () => void;
}

interface State {
    show: boolean;
    visible: boolean;
}

export class FeedbackUI extends Component<Props, State> {
    private scheduledHide?: any;

    constructor(props: Props) {
        super(props);
        this.state = {
            show: false,
            visible: false,
        };
    }

    public render() {
        return (
            <div
                className={`${styles.Feedback} ${classNames({
                    [styles.Show]: this.state.show,
                    [styles.Visible]: this.state.visible,
                })}`}
                style={{
                    transitionDuration: `${transitionDurationMilliseconds}ms`,
                }}
            >
                <div className={styles.Content}>{this.props.children}</div>
                {this.props.actionLabel && (
                    <div className={styles.Action} onClick={this.onActionClick}>
                        {this.props.actionLabel}
                    </div>
                )}
            </div>
        );
    }

    public show() {
        this.setState({
            show: true,
        });

        setTimeout(() => {
            this.setState({
                visible: true,
            });

            if (!this.props.actionLabel) {
                this.scheduleClose();
            }
        });
    }

    public hide() {
        if (this.scheduledHide) {
            clearTimeout(this.scheduledHide);
            this.scheduledHide = undefined;
        }

        this.setState({
            visible: false,
        });

        setTimeout(() => {
            this.setState({
                show: false,
            });
        }, transitionDurationMilliseconds);
    }

    private onActionClick = () => {
        this.props.onActionClick?.call(null);
        this.hide();
    };

    private scheduleClose() {
        if (this.scheduledHide) {
            clearTimeout(this.scheduledHide);
        }
        this.scheduledHide = setTimeout(() => {
            this.hide();
        }, visibleDurationSeconds * 1000);
    }
}
