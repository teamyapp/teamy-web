import { Component, MouseEvent } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TooltipUI } from '@lib/ui/Tooltip';

import { TaskLink } from '@core/entity/taskLink';

import styles from './TaskLinkIcon.module.scss';
import { RelativeLayout } from '@lib/layout';

interface Props {
    link: TaskLink;
    relativeLayout: RelativeLayout
}

interface State {
    isHover: boolean;
}

export class TaskLinkIconUI extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isHover: false,
        };
    }

    public render() {
        const taskLink = this.state.isHover
            ? this.props.link.iconHoverUrl
            : this.props.link.iconUrl;
        return (
            <TooltipUI
                relativeLayout={this.props.relativeLayout}
                message={this.props.link.previewTitle} >
                <div
                    className={styles.TaskLink}
                    onMouseEnter={this.onMouseEnterTaskLink}
                    onMouseLeave={this.onMouseLeaveTaskLink}
                >
                    <a
                        href={this.props.link.url}
                        rel='noreferrer'
                        target='_blank'
                        onClick={this.onTaskLinkClick}
                    >
                        {this.props.link.iconUrl ? (
                            <img
                                className={styles.TaskLinkImg}
                                src={taskLink}
                                alt={this.props.link.previewTitle}
                            />
                        ) : (
                            <div className={styles.TaskLinkIcon}>
                                <MaterialIconUI>link</MaterialIconUI>
                            </div>
                        )}
                    </a>
                </div>
            </TooltipUI>
        );
    }

    private onMouseEnterTaskLink = () => {
        this.setState({
            isHover: true,
        });
    };

    private onMouseLeaveTaskLink = () => {
        this.setState({
            isHover: false,
        });
    };

    private onTaskLinkClick = (event: MouseEvent) => {
        event.stopPropagation();
    };
}
