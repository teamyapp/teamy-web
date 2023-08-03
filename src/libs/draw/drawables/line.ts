import { rotate } from '@lib/draw/drawables/draw';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class Line implements Drawable {
    constructor(private _position: Point) {
        this._width = 0;
        this._rotationAngle = 0;
        this._thickness = 1;
        this._strokeColor = 'black';
    }

    private _width: number;

    set width(val: number) {
        this._width = val;
    }

    private _rotationAngle: number;

    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(val: number) {
        this._rotationAngle = val;
    }

    private _thickness: number;

    get thickness(): number {
        return this._thickness;
    }

    set thickness(val: number) {
        this._thickness = val;
    }

    private _strokeColor?: string;

    set strokeColor(val: string | undefined) {
        this._strokeColor = val;
    }

    get position(): Point {
        return this._position;
    }

    set position(val: Point) {
        this._position = val;
    }

    get size(): Size {
        return {
            width: this._width,
            height: 0,
        };
    }

    draw(ctx: CanvasRenderingContext2D, dpi: number): void {
        ctx.save();
        ctx.beginPath();
        ctx.translate(this._position.left * dpi, this._position.top * dpi);
        rotate(ctx, this._rotationAngle);
        ctx.translate(-this._position.left * dpi, -this._position.top * dpi);

        ctx.lineWidth = this._thickness * dpi;
        if (this._strokeColor) {
            ctx.strokeStyle = this._strokeColor;
        }

        ctx.moveTo(this._position.left * dpi, this._position.top * dpi);
        ctx.lineTo(
            this._position.left * dpi + this._width * dpi,
            this._position.top * dpi,
        );
        ctx.stroke();
        ctx.restore();
    }
}
