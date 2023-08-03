import { Point } from '@lib/ui/position';

export interface Size {
    width: number;
    height: number;
}

export interface Drawable {
    position: Point;
    size: Size;
    rotationAngle: number;

    draw(ctx: CanvasRenderingContext2D, dpi: number): void;
}
