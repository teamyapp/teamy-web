import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class Group implements Drawable {
    private _position: Point;
    private _size: Size;
    private _rotationAngle: number;

    constructor(private readonly drawables: Drawable[]) {
        // TODO: pass in position
        // TODO: compute size based on drawables
        this._position = { left: 0, top: 0 };
        this._size = { width: 0, height: 0 };
        this._rotationAngle = 0;
    }

    get position(): Point {
        return this._position;
    }

    set position(val: Point) {
        this._position = val;
    }

    get size(): Size {
        return this._size;
    }

    set size(val: Size) {
        this._size = val;
    }

    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(val: number) {
        this._rotationAngle = val;
    }

    draw(ctx: CanvasRenderingContext2D, dpi: number): void {
        this.drawables.forEach((drawable) => {
            drawable.draw(ctx, dpi);
        });
    }
}
