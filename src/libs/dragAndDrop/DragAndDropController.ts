import { PopChannel, chan, multi } from '@lib/csp/csp';
import { Event } from '@lib/event/event';

export interface DragTarget {
    type: string;
    element: HTMLElement;
    data: any;
}

export type DragAndDropEvent = DragEnter | DragLeave | Drop;

interface DragEnter extends Event {
    type: 'DragEnter';
    containerId: string;
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

export class DragAndDropController {
    private readonly dragAndDropEventChan = chan<DragAndDropEvent>();
    private readonly dragAndDropMultiCaster = multi<DragAndDropEvent>(
        this.dragAndDropEventChan,
    );

    private dragEnterCount: { [containerId: string]: number } = {};
    private sourceContainerId?: string;
    private draggedTarget?: DragTarget;
    private receivingContainerId?: string;

    public onDragStart(sourceContainerId: string, dragTarget: DragTarget) {
        this.sourceContainerId = sourceContainerId;
        this.draggedTarget = dragTarget;
    }

    public onDragEnterContainer(containerId: string): void {
        if (containerId !== this.sourceContainerId) {
            if (this.receivingContainerId !== containerId) {
                // Notify
                if (this.receivingContainerId) {
                    this.onDragLeaveContainer(this.receivingContainerId);
                }
                this.receivingContainerId = containerId;
                this.dragEnterCount[containerId] = 0;
                this.dragAndDropEventChan.put({
                    type: 'DragEnter',
                    containerId: containerId,
                });
            }

            this.dragEnterCount[containerId]++;
        }
    }

    public onDragLeaveContainer(containerId: string): void {
        if (containerId === this.receivingContainerId) {
            this.dragEnterCount[containerId]--;
            if (this.dragEnterCount[containerId] === 0) {
                // Notify
                this.receivingContainerId = undefined;
                this.dragAndDropEventChan.put({
                    type: 'DragLeave',
                    containerId: containerId,
                });
            }
        }
    }

    public onDropAtContainer(containerId: string): void {
        if (
            this.sourceContainerId &&
            this.draggedTarget &&
            this.sourceContainerId !== containerId
        ) {
            this.dragAndDropEventChan.put({
                type: 'Drop',
                srcContainId: this.sourceContainerId,
                destContainerId: containerId,
                target: this.draggedTarget,
            });
        }

        this.onDragLeaveContainer(containerId);
        this.sourceContainerId = undefined;
        this.draggedTarget = undefined;
    }

    public subscribeDragAndDropEvent(): PopChannel<
        DragAndDropEvent | undefined
    > {
        return this.dragAndDropMultiCaster.copy();
    }
}
