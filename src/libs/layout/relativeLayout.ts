import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';

export type HorizontalAlignment = 'left' | 'right' | 'center';

export type VerticalAlignment = 'top' | 'bottom' | 'center';

export interface LayoutAttachment {
    detach(): void;
}

export class RelativeLayout {
    constructor(
        private boundingBoxChangeEventMonitor: BoundingBoxChangeEventMonitor,
    ) {}

    public attachElements(
        referenceEl: HTMLElement,
        followerEl: HTMLElement,
        horizontalAlignment: HorizontalAlignment = 'center',
        verticalAlignment: VerticalAlignment = 'bottom',
    ): LayoutAttachment {
        const updateFollowerPosition = () => {
            const referenceRect = referenceEl.getBoundingClientRect();
            const followerRect = followerEl.getBoundingClientRect();
            let top = calcTop(referenceRect, followerRect, verticalAlignment);
            let left = calcLeft(
                referenceRect,
                followerRect,
                horizontalAlignment,
            );
            followerEl.style.left = `${left}px`;
            followerEl.style.top = `${top}px`;
        };
        this.boundingBoxChangeEventMonitor.addEventListener(
            referenceEl,
            updateFollowerPosition,
        );
        return {
            detach: () => {
                this.boundingBoxChangeEventMonitor.removeEventListener(
                    referenceEl,
                    updateFollowerPosition,
                );
            },
        };
    }
}

function calcLeft(
    referenceRect: DOMRect,
    followerRect: DOMRect,
    alignment: HorizontalAlignment,
) {
    switch (alignment) {
        case 'left':
            return referenceRect.left;
        case 'right':
            return (
                referenceRect.left + referenceRect.width - followerRect.width
            );
        case 'center':
            return (
                referenceRect.left +
                (referenceRect.width - followerRect.width) / 2
            );
    }
}

function calcTop(
    referenceRect: DOMRect,
    followerRect: DOMRect,
    alignment: VerticalAlignment,
) {
    switch (alignment) {
        case 'top':
            return referenceRect.top - followerRect.height;
        case 'bottom':
            return referenceRect.top + referenceRect.height;
        case 'center':
            return (
                referenceRect.top +
                referenceRect.height / 2 -
                followerRect.height / 2
            );
    }
}
