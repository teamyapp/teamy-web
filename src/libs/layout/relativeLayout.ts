import { BoundingBoxChangeEventMonitor } from '@lib/event/boundingBoxEvent';

export type HorizontalAlignment = 'left' | 'right' | 'center';

export type VerticalAlignment = 'top' | 'bottom' | 'center';

export type OverSpaceAction = 'overlap' | 'jumpHorizontally' | 'jumpVertically';

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
        referenceOffset: number = 10,
        viewportOffset: number = 10,
    ): LayoutAttachment {
        const updateFollowerPosition = () => {
            const referenceRect = referenceEl.getBoundingClientRect();
            const followerRect = followerEl.getBoundingClientRect();
            const top = calcTop(
                referenceRect,
                followerRect,
                verticalAlignment,
                overSpaceAction,
                referenceOffset,
                viewportOffset,
            );
            const left = calcLeft(
                referenceRect,
                followerRect,
                horizontalAlignment,
                overSpaceAction,
                referenceOffset,
                viewportOffset,
            );
            followerEl.style.left = `${left}px`;
            followerEl.style.top = `${top}px`;
        };
        this.boundingBoxChangeEventMonitor.addEventListener(
            referenceEl,
            updateFollowerPosition,
        );
        this.boundingBoxChangeEventMonitor.addEventListener(
            followerEl,
            updateFollowerPosition,
        );
        return {
            detach: () => {
                this.boundingBoxChangeEventMonitor.removeEventListener(
                    referenceEl,
                    updateFollowerPosition,
                );
                this.boundingBoxChangeEventMonitor.removeEventListener(
                    followerEl,
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
    referenceOffset: number,
    viewportOffset: number,
) {
    let left = 0;
    switch (alignment) {
        case 'left':
            left = referenceRect.left - followerRect.width - referenceOffset;
            break;
        case 'right':
            left = referenceRect.left + referenceRect.width + referenceOffset;
            break;
        case 'center':
            left =
                referenceRect.left +
                (referenceRect.width - followerRect.width) / 2;
            break;
    }

    const rightBound =
        (window.innerWidth || document.documentElement.clientWidth) - viewportOffset;
    const right = left + followerRect.width;
    if (left >= viewportOffset && right <= rightBound) {
        return left;
    }

    if (left < viewportOffset) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'jumpVertically':
                left = viewportOffset;
                break;
            case 'jumpHorizontally':
                left = referenceRect.left + referenceRect.width + referenceOffset;
                break;
        }
    }

    if (right > rightBound) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'jumpVertically':
                left = rightBound - followerRect.width;
                break;
            case 'jumpHorizontally':
                left = referenceRect.left - followerRect.width - referenceOffset;
                break;
        }
    }

    return Math.max(left, viewportOffset);
}

function calcTop(
    referenceRect: DOMRect,
    followerRect: DOMRect,
    alignment: VerticalAlignment,
    overSpaceAction: OverSpaceAction,
    referenceOffset: number,
    viewportOffset: number,
) {
    let top = 0;
    switch (alignment) {
        case 'top':
            top = referenceRect.top - followerRect.height - referenceOffset;
            break;
        case 'bottom':
            top = referenceRect.top + referenceRect.height + referenceOffset;
            break;
        case 'center':
            top =
                referenceRect.top
                referenceRect.height / 2 -
                followerRect.height / 2;
            break;
    }

    const bottomBound =
        window.innerHeight || document.documentElement.clientHeight - viewportOffset;
    const bottom = top + followerRect.height;
    if (top >= viewportOffset && bottom <= bottomBound) {
        return top;
    }

    if (top < viewportOffset) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'jumpHorizontally':
                top = viewportOffset;
                break;
            case 'jumpVertically':
                top = referenceRect.top + referenceRect.height + referenceOffset;
                break;
        }
    }

    if (bottom > bottomBound) {
        switch (overSpaceAction) {
            case 'overlap':
            case 'jumpHorizontally':
                top = bottomBound - followerRect.height;
                break;
            case 'jumpVertically':
                top = referenceRect.top - followerRect.height - referenceOffset;
                break;
        }
    }

    return Math.max(top, viewportOffset);
}
