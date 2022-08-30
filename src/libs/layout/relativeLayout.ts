import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';

export type HorizontalAlignment = 'left' | 'right' | 'center';

export type VerticalAlignment = 'top' | 'bottom' | 'center';

export type OverSpaceAction = 'overlap' | 'horizontalShift' | 'verticalShift';

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
        overSpaceAction: OverSpaceAction = 'overlap',
        offset: number = 10
    ): LayoutAttachment {
        const updateFollowerPosition = () => {
            const referenceRect = referenceEl.getBoundingClientRect();
            const followerRect = followerEl.getBoundingClientRect();
            const top = calcTop(
                referenceRect,
                followerRect,
                verticalAlignment,
                overSpaceAction,
                offset
            );
            const left = calcLeft(
                referenceRect,
                followerRect,
                horizontalAlignment,
                overSpaceAction,
                offset
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
    overSpaceAction: OverSpaceAction,
    offset: number
) {
    let left = 0;

    switch (alignment) {
        case 'left':
            left = referenceRect.left;
            break
        case 'right':
            left =
                referenceRect.left + referenceRect.width - followerRect.width;
                break
        case 'center':
            left =
                referenceRect.left +
                (referenceRect.width - followerRect.width) / 2;
                break
    }
    const windowRight =
        window.innerWidth || document.documentElement.clientWidth;
    const right = left + followerRect.width;

    if (left >= 0 && right <= windowRight) {
        return left;
    }

    if (overSpaceAction !== 'horizontalShift' && left < 0) {
        return offset
    } else if (overSpaceAction !== 'horizontalShift' && right > windowRight) {
        return windowRight - followerRect.width - offset
    } else if (overSpaceAction === 'horizontalShift' && left < 0) {
        return referenceRect.left
    } else {
        return referenceRect.left + referenceRect.width - followerRect.width;
    }
}

function calcTop(
    referenceRect: DOMRect,
    followerRect: DOMRect,
    alignment: VerticalAlignment,
    overSpaceAction: OverSpaceAction,
    offset: number
) {

    let top = 0

    switch (alignment) {
        case 'top':
            top = referenceRect.top - followerRect.height;
            break
        case 'bottom':
            top = referenceRect.top + referenceRect.height;
            break
        case 'center':
            top = (
                referenceRect.top +
                referenceRect.height / 2 -
                followerRect.height / 2
            );
            break
    }
    const bottom = top + followerRect.height
    const windowBottom =
    window.innerHeight || document.documentElement.clientHeight;

    if (top >= 0 && bottom < windowBottom) {
        return top
    }

    if (overSpaceAction  !== 'verticalShift' && top < 0) {
        return offset
    } else if (overSpaceAction  !== 'verticalShift' && bottom > windowBottom) {
        return windowBottom - followerRect.height - offset
    } else if (overSpaceAction === 'verticalShift' && top < 0) {
        return referenceRect.top + referenceRect.height;
    } else {
        return referenceRect.top - followerRect.height
    }
}
