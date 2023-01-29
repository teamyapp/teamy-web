import { Component } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { TaskLink } from '@core/entity/taskLink';

import styles from './TaskLink.module.scss';

interface Props {
    link: TaskLink;
}

interface State {
    isHoverLink: boolean;
}

export class TaskLinkIconUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isHoverLink: false,
        };
    }

    public render() {
        const taskLink = this.state.isHoverLink
            ? this.props.link.iconHoverUrl
            : this.props.link.iconUrl;

        return (
            <div>
                <TooltipUI message={this.props.link.title}>
                    <div
                        className={`${styles.Action}`}
                        onMouseEnter={this.onMouseEnterTaskLink}
                        onMouseLeave={this.onMouseLeaveTaskLink}
                    >
                        <a
                            href={this.props.link.url}
                            rel='noreferrer'
                            target='_blank'
                            className={styles.TaskLink}
                        >
                            {this.props.link.iconUrl ? (
                                <img
                                    className={styles.TaskLinkImg}
                                    src={taskLink}
                                    alt={this.props.link.title}
                                />
                            ) : (
                                <div className={styles.TaskLinkIcon}>
                                    <MaterialIconUI>link</MaterialIconUI>
                                </div>
                            )}
                        </a>
                    </div>
                </TooltipUI>
            </div>
        );
    }

    private onMouseEnterTaskLink = () => {
        this.setState({
            isHoverLink: true,
        });
    };

    private onMouseLeaveTaskLink = () => {
        this.setState({
            isHoverLink: false,
        });
    };
}
