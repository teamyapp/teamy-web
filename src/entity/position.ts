export interface Rect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface IBoundingBoxFinder {
    (): Rect;
}
