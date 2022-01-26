import classNames from 'classnames';
import React, { Component, DragEvent } from 'react';

import { PopChannel } from '../csp/csp';
import styles from './DragAndDropContainer.module.scss';
import {
    DragAndDropController,
    DragAndDropEvent,
} from './DragAndDropController';

interface Props {
    dragAndDropController: DragAndDropController;
    containerId: string;
    itemType: string;
}

interface State {
    isReceiving: boolean;
}

export class DragAndDropContainer extends Component<Props, State> {
    private dragAndDropEventChan?: PopChannel<DragAndDropEvent | undefined>;

    constructor(props: Props) {
        super(props);
        this.state = {
            isReceiving: false,
        };
    }

    public render() {
        return (
            <div
                className={`${styles.Container} ${classNames({
                    [styles.Receiving]: this.state.isReceiving,
                })}`}
                onDragEnter={this.onDragEnter}
                onDragLeave={this.onDragLeave}
                onDragOver={onDragOver}
                onDrop={this.onDrop}
            >
                {this.props.children}
            </div>
        );
    }

    public componentDidMount() {
        this.dragAndDropEventChan =
            this.props.dragAndDropController.subscribeDragAndDropEvent();

        (async () => {
            while (true) {
                const event = await this.dragAndDropEventChan?.pop();
                if (event === undefined) {
                    return;
                }

                switch (event.type) {
                    case 'DragEnter':
                        if (event.containerId === this.props.containerId) {
                            this.setState({
                                isReceiving: true,
                            });
                        }
                        break;
                    case 'DragLeave':
                        if (event.containerId === this.props.containerId) {
                            this.setState({
                                isReceiving: false,
                            });
                        }
                        break;
                }
            }
        })();
    }

    public componentWillUnmount() {
        this.dragAndDropEventChan?.close();
    }

    private onDragEnter = () => {
        this.props.dragAndDropController.onDragEnterContainer(
            this.props.containerId,
        );
    };

    private onDragLeave = () => {
        this.props.dragAndDropController.onDragLeaveContainer(
            this.props.containerId,
        );
    };

    private onDrop = () => {
        this.props.dragAndDropController.onDropAtContainer(
            this.props.containerId,
        );
    };
}

function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
}
