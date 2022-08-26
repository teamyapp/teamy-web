import { EventListener, EventMonitor } from '@lib/event/event';
import { Rect } from '@lib/ui/position';

export interface BoundingBoxChangeEventContext {
    target: HTMLElement;
    prevRect?: Rect;
    currRect: Rect;
}

export class BoundingBoxChangeEventMonitor implements EventMonitor {
    private readonly previousBoundingBox = new Map<HTMLElement, Rect>();
    private readonly allEventListeners = new Map<
        HTMLElement,
        EventListener<BoundingBoxChangeEventContext>[]
    >();

    detectEvent = () => {
        this.allEventListeners.forEach((listeners, target) => {
            const domRect = target.getBoundingClientRect();
            const currRect: Rect = {
                top: domRect.top,
                left: domRect.left,
                width: domRect.width,
                height: domRect.height,
            };
            const prevRect = this.previousBoundingBox.get(target);
            const context: BoundingBoxChangeEventContext = {
                target,
                prevRect,
                currRect,
            };
            if (!prevRect || !areRectsEqual(prevRect, currRect)) {
                listeners.forEach((listener) => {
                    (async () => {
                        listener(context);
                    })();
                });
            }

            this.previousBoundingBox.set(target, currRect);
        });
    };

    public addEventListener(
        target: HTMLElement,
        listener: EventListener<BoundingBoxChangeEventContext>,
    ) {
        const listeners = this.allEventListeners.get(target) || [];
        listeners.push(listener);
        this.allEventListeners.set(target, listeners);
    }

    public removeEventListener(
        target: HTMLElement,
        listener: EventListener<BoundingBoxChangeEventContext>,
    ) {
        let listeners = this.allEventListeners.get(target);
        if (!listeners) {
            return;
        }

        listeners = listeners.filter(
            (currListener) => currListener !== listener,
        );
        if (listeners.length > 0) {
            this.allEventListeners.set(target, listeners);
        } else {
            this.previousBoundingBox.delete(target);
            this.allEventListeners.delete(target);
        }
    }
}

function areRectsEqual(rect1: Rect, rect2: Rect): boolean {
    return (
        rect1.top === rect2.top &&
        rect1.left === rect2.left &&
        rect1.width === rect2.width &&
        rect1.height === rect2.height
    );
}
