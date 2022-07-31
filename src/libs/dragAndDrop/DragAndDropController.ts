import { PopChannel, chan, multi } from '@lib/csp/csp';
import { Event } from '@lib/event/event';
import { Point, Rect } from '@lib/ui/position';

import { Size, SizeTransformer } from './size';

export type DragAndDropEvent =
    | DragEnter
    | DragLeave
    | DragEnd
    | Drag
    | Drop
    | TurnOnDragging
    | TurnOffDragging;

export interface DragTarget {
    type: string;
    element: HTMLElement;
    data: any;
}

interface DragEnter extends Event {
    type: 'DragEnter';
    containerId: string;
    itemType: string;
}

interface DragLeave extends Event {
    type: 'DragLeave';
    containerId: string;
}

interface Drop extends Event {
    type: 'Drop';
    srcContainId: string;
    destContainerId: string;
    target: DragTarget;
}

interface Drag extends Event {
    type: 'Drag';
    mousePosition: Point;
}

interface DragEnd extends Event {
    type: 'DragEnd';
}

interface TurnOnDragging extends Event {
    type: 'TurnOnDragging';
    itemType: string;
}

interface TurnOffDragging extends Event {
    type: 'TurnOffDragging';
    itemType: string;
}

export class DragAndDropController {
    private readonly dragAndDropEventChan = chan<DragAndDropEvent>();
    private readonly dragAndDropMultiCaster = multi<DragAndDropEvent>(
        this.dragAndDropEventChan,
    );

    private sourceContainerId?: string;
    private draggedTarget?: DragTarget;
    private receivingLayer: number = 0;
    private receivingContainerId?: string;
    private itemLeftOffset = 0;
    private itemTopOffset = 0;
    private preview?: HTMLElement;

    public onDragStart(
        sourceContainerId: string,
        dragTarget: DragTarget,
        leftOffset: number,
        topOffset: number,
    ) {
        this.itemLeftOffset = leftOffset;
        this.itemTopOffset = topOffset;
        this.sourceContainerId = sourceContainerId;
        this.draggedTarget = dragTarget;
        if (dragTarget.element) {
            this.createPreview(dragTarget.element);
        }
    }

    public onContainerMouseEnter(
        containerId: string,
        transformItemSize: SizeTransformer,
        receiverLayer: number,
    ): void {
        if (!this.draggedTarget) {
            return;
        }

        if (
            containerId === this.sourceContainerId ||
            containerId === this.receivingContainerId
        ) {
            return;
        }

        if (receiverLayer < this.receivingLayer) {
            return;
        }

        if (this.receivingContainerId) {
            this.onContainerMouseLeave(this.receivingContainerId);
        }

        this.receivingLayer = receiverLayer;
        this.adjustPreviewSize(transformItemSize);
        this.receivingContainerId = containerId;
        this.dragAndDropEventChan.put({
            type: 'DragEnter',
            containerId: containerId,
            itemType: this.draggedTarget.type,
        });
    }

    public onContainerMouseLeave(containerId: string): void {
        if (!this.draggedTarget) {
            return;
        }

        if (containerId === this.receivingContainerId) {
            this.receivingLayer = 0;
            this.receivingContainerId = undefined;
            this.dragAndDropEventChan.put({
                type: 'DragLeave',
                containerId: containerId,
            });
        }
    }

    public onDropAtContainer(containerId: string): void {
        if (
            this.sourceContainerId &&
            this.draggedTarget &&
            this.sourceContainerId !== containerId
        ) {
            this.receivingLayer = 0;
            this.dragAndDropEventChan.put({
                type: 'Drop',
                srcContainId: this.sourceContainerId,
                destContainerId: containerId,
                target: this.draggedTarget,
            });
        }

        this.sourceContainerId = undefined;
        this.draggedTarget = undefined;
    }

    public onDrag(left: number, top: number) {
        this.dragAndDropEventChan.put({
            type: 'Drag',
            mousePosition: {
                left: left,
                top: top,
            },
        });
        this.movePreview(left, top);
    }

    public subscribeDragAndDropEvent(): PopChannel<
        DragAndDropEvent | undefined
    > {
        return this.dragAndDropMultiCaster.copy();
    }

    public turnOnDragging(itemType: string) {
        this.dragAndDropEventChan.put({ type: 'TurnOnDragging', itemType });
    }

    public turnOffDragging(itemType: string) {
        this.dragAndDropEventChan.put({ type: 'TurnOffDragging', itemType });
    }

    public isInside(containerRect: Rect, mousePosition: Point): boolean {
        const containerBottom = containerRect.top + containerRect.height;
        const containerRight = containerRect.left + containerRect.width;
        const horizontal =
            mousePosition.left >= containerRect.left &&
            mousePosition.left <= containerRight;
        const vertical =
            mousePosition.top >= containerRect.top &&
            mousePosition.top <= containerBottom;
        return horizontal && vertical;
    }

    private adjustPreviewSize(transformItemSize: SizeTransformer) {
        if (this.preview) {
            const itemSize: Size = {
                width: this.preview.offsetWidth,
                height: this.preview.offsetHeight,
            };

            const newItemSize = transformItemSize(itemSize);
            this.itemLeftOffset *= newItemSize.width / itemSize.width;
            this.itemTopOffset *= newItemSize.height / itemSize.height;
            this.preview.style.width = `${newItemSize.width}px`;
            this.preview.style.height = `${newItemSize.height}px`;
        }
    }

    private onMouseUp = () => {
        if (this.receivingContainerId) {
            this.onDropAtContainer(this.receivingContainerId);
            this.onContainerMouseLeave(this.receivingContainerId);
            this.receivingContainerId = undefined;
        }
        this.sourceContainerId = undefined;
        this.draggedTarget = undefined;
        this.dragAndDropEventChan.put({ type: 'DragEnd' });
        this.removePreview();
    };

    private createPreview(targetElement: HTMLElement) {
        this.preview = document.createElement('div');

        this.preview.style.position = 'fixed';
        this.preview.style.zIndex = '1000';
        this.preview.style.display = 'none';
        this.preview.style.width = `${targetElement.offsetWidth}px`;
        this.preview.style.height = `${targetElement.offsetHeight}px`;
        this.preview.style.left = `${targetElement.offsetLeft}px`;
        this.preview.style.top = `${targetElement.offsetTop}px`;
        this.preview.style.display = 'block';

        const copiedNode = targetElement.cloneNode(true);
        this.preview.appendChild(copiedNode);
        this.preview.addEventListener('mouseup', this.onMouseUp);
        document.body.appendChild(this.preview);
        this.preview.focus();
    }

    private removePreview() {
        if (!this.preview) {
            return;
        }

        this.preview.style.display = 'none';
        this.preview.remove();
    }

    private movePreview(mouseLeft: number, mouseTop: number) {
        if (!this.preview) {
            return;
        }
        this.preview.style.left = `${mouseLeft - this.itemLeftOffset}px`;
        this.preview.style.top = `${mouseTop - this.itemTopOffset}px`;
    }
}
