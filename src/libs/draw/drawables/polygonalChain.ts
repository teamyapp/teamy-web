import { rotate } from '@lib/draw/drawables/draw';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

export class PolygonalChain implements Drawable {
    private _position: Point;
    private _size: Size;
    private _rotationAngle: number;
    private _thickness: number;
    private _strokeColor?: string;

    constructor(private readonly points: Point[]) {
        this._position = {
            left: 0,
            top: 0,
        };
        this._size = {
            width: 0,
            height: 0,
        };

        if (this.points.length > 0) {
            let minLeft = points[0].left;
            let maxLeft = points[0].left;
            let minTop = points[0].top;
            let maxTop = points[0].top;

            for (let index = 1; index < this.points.length; index++) {
                minLeft = Math.min(minLeft, points[index].left);
                maxLeft = Math.max(maxLeft, points[index].left);
                minTop = Math.min(minTop, points[index].top);
                maxTop = Math.max(maxLeft, points[index].top);
            }

            this._position = {
                left: minLeft,
                top: minTop,
            };
            this._size = {
                width: maxLeft - minLeft,
                height: maxTop - minTop,
            };
        }

        this._rotationAngle = 0;
        this._thickness = 1;
        this._strokeColor = 'black';
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

    get rotationAngle(): number {
        return this._rotationAngle;
    }

    set rotationAngle(val: number) {
        this._rotationAngle = val;
    }

    get thickness(): number {
        return this._thickness;
    }

    set thickness(val: number) {
        this._thickness = val;
    }

    set strokeColor(val: string | undefined) {
        this._strokeColor = val;
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

        if (this.points.length > 0) {
            ctx.moveTo(this.points[0].left * dpi, this.points[0].top * dpi);
        }

        for (let index = 1; index < this.points.length; index++) {
            ctx.lineTo(
                this.points[index].left * dpi,
                this.points[index].top * dpi,
            );
        }

        ctx.stroke();
        ctx.restore();
    }
}
