import React, {
    Component,
    MouseEvent as ReactMouseEvent,
    createRef,
} from 'react';

import { PopChannel } from '@lib/csp/csp';

import {
    DragAndDropController,
    DragAndDropEvent,
} from './DragAndDropController';

const dragMinMouseMove = 5;

interface Props {
    dragAndDropController: DragAndDropController;
    containerId: string;
    itemType: string;
    data: any;
}

interface State {
    hide: boolean;
}

export class Draggable extends Component<Props, State> {
    private dragAndDropEventChan?: PopChannel<DragAndDropEvent | undefined>;
    private readonly ref = createRef<HTMLDivElement>();

    private isDraggingEnabled = true;
    private mouseDownLeft = 0;
    private mouseDownTop = 0;
    private leftOffset = 0;
    private topOffset = 0;
    private isDragging = false;

    constructor(props: Props) {
        super(props);
        this.state = {
            hide: false,
        };
    }

    public render() {
        return (
            <div
                ref={this.ref}
                style={{
                    opacity: this.state.hide ? 0 : 1,
                }}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onDoubleClick={this.onDoubleClick}
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
                    case 'DragEnd': {
                        this.exitDragging();
                        break;
                    }
                    case 'TurnOffDragging': {
                        if (event.itemType === this.props.itemType) {
                            this.isDraggingEnabled = false;
                            this.exitDragging();
                        }
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
        this.dragAndDropEventChan?.close();
    }

    private onMouseDown = (event: ReactMouseEvent) => {
        if (!this.isDraggingEnabled) {
            return;
        }

        const rect = this.ref.current!.getBoundingClientRect();
        this.mouseDownLeft = event.pageX;
        this.mouseDownTop = event.pageY;
        this.leftOffset = event.pageX - rect.left;
        this.topOffset = event.pageY - rect.top;
        document.addEventListener('mousemove', this.onMouseMove);
    };

    private onMouseUp = () => {
        this.exitDragging();
    };

    private onDoubleClick = () => {
        this.exitDragging();
    };

    private exitDragging() {
        document.removeEventListener('mousemove', this.onMouseMove);
        this.isDragging = false;
        document.body.style.userSelect = 'auto';
        this.setState({
            hide: false,
        });
    }

    private onMouseMove = (event: MouseEvent) => {
        if (this.isDragging) {
            this.onDrag(event.x, event.y);
        } else if (
            distance(event.x, event.y, this.mouseDownLeft, this.mouseDownTop) >=
            dragMinMouseMove
        ) {
            document.body.style.userSelect = 'none';
            this.isDragging = true;
            this.onDragStart();
        }
    };

    private onDragStart = () => {
        this.props.dragAndDropController.onDragStart(
            this.props.containerId,
            {
                type: this.props.itemType,
                data: this.props.data,
                element: this.ref.current!,
            },
            this.leftOffset,
            this.topOffset,
        );
        this.setState({
            hide: true,
        });
    };

    private onDrag = (left: number, top: number) => {
        this.props.dragAndDropController.onDrag(left, top);
    };
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    const xDiff = x2 - x1;
    const yDiff = y2 - y1;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
