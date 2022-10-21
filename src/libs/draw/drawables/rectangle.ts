import { rotate } from '@lib/draw/drawables/draw';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class Rectangle implements Drawable {
    private _size: Size;
    private _rotationAngle: number;
    private _strokeColor?: string;
    private _strokeWidth: number = 1;
    private _fillColor?: string;

    constructor(private _position: Point) {
        this._size = {
            width: 0,
            height: 0,
        };
        this._rotationAngle = 0;
        this._strokeColor = 'black';
        this._fillColor = '#f5f5f5';
    }

    draw(ctx: CanvasRenderingContext2D, dpi: number): void {
        ctx.save();
        ctx.beginPath();

        const centerX = (this._position.left + this._size.width / 2) * dpi;
        const centerY = (this._position.top + this._size.height / 2) * dpi;
        ctx.translate(centerX, centerY);
        rotate(ctx, this._rotationAngle);
        ctx.translate(-centerX, -centerY);

        ctx.rect(
            this._position.left * dpi,
            this._position.top * dpi,
            this._size.width * dpi,
            this._size.height * dpi,
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

    set fillColor(val: string | undefined) {
        this._fillColor = val;
    }

    set strokeColor(val: string | undefined) {
        this._strokeColor = val;
    }

    set strokeWidth(val: number) {
        this._strokeWidth = val;
    }

    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(val: number) {
        this._rotationAngle = val;
    }
}
