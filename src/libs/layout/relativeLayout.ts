import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';

export type HorizontalAlignment = 'left' | 'right' | 'center';

export type VerticalAlignment = 'top' | 'bottom' | 'center';

export type OverSpaceAction = 'overlap' | 'shiftHorizontal' | 'shiftVertical';

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
        offset: number = 10,
    ): LayoutAttachment {
        const updateFollowerPosition = () => {
            const referenceRect = referenceEl.getBoundingClientRect();
            const followerRect = followerEl.getBoundingClientRect();
            const top = calcTop(
                referenceRect,
                followerRect,
                verticalAlignment,
                overSpaceAction,
                offset,
            );
            const left = calcLeft(
                referenceRect,
                followerRect,
                horizontalAlignment,
                overSpaceAction,
                offset,
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
    offset: number,
) {
    let left = 0;

    switch (alignment) {
        case 'left':
            left = referenceRect.left;
            break;
        case 'right':
            left =
                referenceRect.left + referenceRect.width - followerRect.width;
            break;
        case 'center':
            left =
                referenceRect.left +
                (referenceRect.width - followerRect.width) / 2;
            break;
    }

    const rightBound =
        (window.innerWidth || document.documentElement.clientWidth) - offset;
    const right = left + followerRect.width;

    if (left >= offset && right <= rightBound) {
        return left;
    }


    if (left < offset) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'shiftVertical':
                left = offset;
                break;
            case 'shiftHorizontal':
                left = referenceRect.left
                break
        }
    }

    if (right > rightBound) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'shiftVertical':
                left = rightBound - followerRect.width
                break
            case 'shiftHorizontal':
                left = referenceRect.left + referenceRect.width - followerRect.width;
                break
        }
    }

    return Math.max(left, offset)
}

function calcTop(
    referenceRect: DOMRect,
    followerRect: DOMRect,
    alignment: VerticalAlignment,
    overSpaceAction: OverSpaceAction,
    offset: number,
) {
    let top = 0;

    switch (alignment) {
        case 'top':
            top = referenceRect.top - followerRect.height;
            break;
        case 'bottom':
            top = referenceRect.top + referenceRect.height;
            break;
        case 'center':
            top =
                referenceRect.top +
                referenceRect.height / 2 -
                followerRect.height / 2;
            break;
    }

    const bottomBound =
        window.innerHeight || document.documentElement.clientHeight - offset;

    const bottom = top + followerRect.height;

    if (top >= offset && bottom <= bottomBound) {
        return top;
    }

    if (top < offset) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'shiftHorizontal':
                top = offset
                break
            case 'shiftVertical':
                top = referenceRect.top + referenceRect.height;
                break
        }
    }

    if (bottom > bottomBound) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'shiftHorizontal':
                top = bottomBound - followerRect.height;
                break
            case 'shiftVertical':
                top = referenceRect.top - followerRect.height
                break
        }  
    }

    return Math.max(top, offset)
}
