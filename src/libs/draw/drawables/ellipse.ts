import { rotate } from '@lib/draw/drawables/draw';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class Ellipse implements Drawable {
    constructor(private _position: Point) {
        this._size = {
            width: 0,
            height: 0,
        };
        this._rotationAngle = 0;
        this._strokeColor = 'black';
        this._fillColor = '#f5f5f5';
    }

    private _size: Size;

    get size(): Size {
        return this._size;
    }

    set size(val: Size) {
        this._size = val;
    }

    private _rotationAngle: number;

    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(val: number) {
        this._rotationAngle = val;
    }

    private _strokeColor?: string;

    set strokeColor(val: string | undefined) {
        this._strokeColor = val;
    }

    private _strokeWidth: number = 1;

    set strokeWidth(val: number) {
        this._strokeWidth = val;
    }

    private _fillColor?: string;

    set fillColor(val: string | undefined) {
        this._fillColor = val;
    }

    get position(): Point {
        return this._position;
    }

    set position(val: Point) {
        this._position = val;
    }

    draw(ctx: CanvasRenderingContext2D, dpi: number): void {
        ctx.save();
        ctx.beginPath();

        const centerX = (this._position.left + this._size.width / 2) * dpi;
        const centerY = (this._position.top + this._size.height / 2) * dpi;
        ctx.translate(centerX, centerY);
        rotate(ctx, this._rotationAngle);
        ctx.translate(-centerX, -centerY);

        const scaledHorizontalRadius = (this._size.width / 2) * dpi;
        const scaledVerticalRadius = (this._size.height / 2) * dpi;
        ctx.ellipse(
            this._position.left * dpi + scaledHorizontalRadius,
            this._position.top * dpi + scaledVerticalRadius,
            scaledHorizontalRadius,
            scaledVerticalRadius,
            this._rotationAngle,
            0,
            Math.PI * 2,
        );
        if (this._strokeColor) {
            ctx.lineWidth = this._strokeWidth * dpi;
            ctx.strokeStyle = this._strokeColor;
            ctx.stroke();
        }

        if (this._fillColor) {
            ctx.fillStyle = this._fillColor;
            ctx.fill();
        }

        ctx.restore();
    }
}
