import React, { Component, createRef } from 'react';

import { DragAndDropController } from './DragAndDropController';

interface Props {
    dragAndDropController: DragAndDropController;
    containerId: string;
    itemType: string;
    data: any;
}

export class Draggable extends Component<Props> {
    private readonly ref = createRef<HTMLDivElement>();

    public render() {
        return (
            <div ref={this.ref} draggable={true} onDragStart={this.onDragStart}>
                {this.props.children}
            </div>
        );
    }

    private onDragStart = () => {
        if (this.ref.current) {
            this.props.dragAndDropController.onDragStart(
                this.props.containerId,
                {
                    type: this.props.itemType,
                    data: this.props.data,
                    element: this.ref.current,
                },
            );
        }
    };
}
