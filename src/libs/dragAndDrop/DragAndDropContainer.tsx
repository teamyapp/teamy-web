import classNames from 'classnames';
import React, { Component, ReactNode, createRef } from 'react';

import { PopChannel } from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';

import styles from './DragAndDropContainer.module.scss';
import {
    DragAndDropContext,
    DragAndDropController,
    DragAndDropEvent,
} from './DragAndDropController';
import { Size, SizeTransformer, sizeUnchanged } from './size';

interface Props {
    children: ReactNode;
    dragAndDropController: DragAndDropController;
    itemSizeTransformer?: (containerSize: Size) => SizeTransformer;
    receiverLayer?: number;
    containerId: string;
    itemType: string;
    context?: DragAndDropContext
}

interface State {
    isReceiving: boolean;
}

export class DragAndDropContainer extends Component<Props, State> {
    private readonly ref = createRef<HTMLDivElement>();
    private dragAndDropEventChan?: PopChannel<DragAndDropEvent | undefined>;
    private isDraggingEnabled = true;

    constructor(props: Props) {
        super(props);
        this.state = {
            isReceiving: false,
        };
    }

    public render() {
        return (
            <div
                ref={this.ref}
                className={`${styles.Container} ${classNames({
                    [styles.Receiving]: this.state.isReceiving,
                })}`}
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
                    case 'Drag': {
                        const domRect =
                            this.ref.current!.getBoundingClientRect();
                        const rect = {
                            left: domRect.left,
                            top: domRect.top,
                            width: domRect.width,
                            height: domRect.height,
                        };

                        if (
                            this.props.dragAndDropController.isInside(
                                rect,
                                event.mousePosition,
                            )
                        ) {
                            this.onMouseEnter();
                        } else {
                            this.onMouseLeave();
                        }
                        break;
                    }
                    case 'DragEnter': {
                        if (
                            event.containerId === this.props.containerId &&
                            event.itemType === this.props.itemType
                        ) {
                            this.setState({
                                isReceiving: true,
                            });
                        }
                        break;
                    }
                    case 'DragLeave': {
                        if (event.containerId === this.props.containerId) {
                            this.setState({
                                isReceiving: false,
                            });
                        }
                        break;
                    }
                    case 'Drop': {
                        if (event.destContainerId === this.props.containerId) {
                            this.setState({
                                isReceiving: false,
                            });
                        }
                        break;
                    }
                    case 'TurnOffDragging': {
                        if (event.itemType === this.props.itemType) {
                            this.isDraggingEnabled = false;
                        }
                        this.onMouseLeave();
                        break;
                    }
                    case 'TurnOnDragging': {
                        if (event.itemType === this.props.itemType) {
                            this.isDraggingEnabled = true;
                        }
                        break;
                    }
                }
            }
        })();
    }

    public componentWillUnmount() {
        closeIfNot(this.dragAndDropEventChan);
    }

    private onMouseEnter = () => {
        if (!this.isDraggingEnabled) {
            return;
        }

        if (!this.state.isReceiving) {
            const itemSizeTransformer =
                this.props.itemSizeTransformer?.call(null, {
                    width: this.ref.current!.offsetWidth,
                    height: this.ref.current!.offsetHeight,
                }) || sizeUnchanged;

            this.props.dragAndDropController.onContainerMouseEnter(
                this.props.containerId,
                itemSizeTransformer,
                this.props.receiverLayer || 0,
                this.props.context
            );
        }
    };

    private onMouseLeave = () => {
        if (this.state.isReceiving) {
            this.props.dragAndDropController.onContainerMouseLeave(
                this.props.containerId,
            );
        }
    };
}
