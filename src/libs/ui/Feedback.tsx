import classNames from 'classnames';
import React, { Component } from 'react';

import styles from './Feedback.module.scss';

const transitionDurationMilliseconds = 200;
const visibleDurationSeconds = 5;

interface Props {
    actionLabel?: string;
    onActionClick?: () => void;
}

interface State {
    show: boolean;
    visible: boolean;
}

export class FeedbackUI extends Component<Props, State> {
    private scheduledClose?: any;

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

    private onActionClick = () => {
        this.props.onActionClick?.call(null);
        this.close();
    };

    private scheduleClose() {
        if (this.scheduledClose) {
            clearTimeout(this.scheduledClose);
        }
        this.scheduledClose = setTimeout(() => {
            this.close();
        }, visibleDurationSeconds * 1000);
    }

    private close() {
        this.setState({
            visible: false,
        });

        setTimeout(() => {
            this.setState({
                show: false,
            });
        }, transitionDurationMilliseconds);
    }
}
