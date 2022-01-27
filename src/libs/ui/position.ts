export interface Point {
    left: number;
    top: number;
}

export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface BoundingBoxFinder {
    (): Rect;
}
