import { rotate } from '@lib/draw/drawables/draw';
import { Drawable, Size } from '@lib/draw/drawables/drawable';
import { Point } from '@lib/ui/position';

type HorizontalAlignment = 'left' | 'center' | 'right';

type FontWeight = 'lighter' | 'normal' | 'bold' | 'bolder';

const RENDER_OFFSET = 1;

export class Text implements Drawable {
    constructor(
        private _position: Point,
        private content: string,
    ) {
        this._size = {
            width: 0,
            height: 0,
        };
        this._rotationAngle = 0;
        this._fillColor = 'black';
        this._fontFamily = 'serif';
        this._fontSize = 16;
        this._fontWeight = 'normal';
        this._horizontalAlign = 'left';
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

    private _fontFamily: string;

    get fontFamily(): string {
        return this._fontFamily;
    }

    set fontFamily(val: string) {
        this._fontFamily = val;
    }

    private _fontSize: number;

    get fontSize(): number {
        return this._fontSize;
    }

    set fontSize(val: number) {
        this._fontSize = val;
    }

    private _fontWeight: FontWeight;

    get fontWeight(): FontWeight {
        return this._fontWeight;
    }

    set fontWeight(val: FontWeight) {
        this._fontWeight = val;
    }

    private _horizontalAlign: HorizontalAlignment;

    get horizontalAlign(): HorizontalAlignment {
        return this._horizontalAlign;
    }

    set horizontalAlign(val: HorizontalAlignment) {
        this._horizontalAlign = val;
    }

    private _backgroundColor?: string;

    get backgroundColor(): string | undefined {
        return this._backgroundColor;
    }

    set backgroundColor(val: string | undefined) {
        this._backgroundColor = val;
    }

    private _showCenter: boolean = false;

    get showCenter(): boolean {
        return this._showCenter;
    }

    set showCenter(val: boolean) {
        this._showCenter = val;
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

        ctx.font = `${this._fontWeight} ${this._fontSize * dpi}px ${
            this._fontFamily
        }`;

        if (this._backgroundColor) {
            ctx.rect(
                this._position.left * dpi,
                this._position.top * dpi,
                this._size.width * dpi,
                this._size.height * dpi,
            );
            ctx.fillStyle = this._backgroundColor;
            ctx.fill();
        }

        ctx.textAlign = this._horizontalAlign;
        ctx.textBaseline = 'top';

        let left;
        switch (this._horizontalAlign) {
            case 'left':
                left = this._position.left;
                break;
            case 'right':
                left = this._position.left + this._size.width;
                break;
            case 'center':
                left = this._position.left + this._size.width / 2;
        }

        if (this._fillColor) {
            ctx.fillStyle = this._fillColor;
            ctx.fillText(
                this.content,
                left * dpi,
                (this._position.top - RENDER_OFFSET) * dpi,
            );
        }

        if (this._strokeColor) {
            ctx.lineWidth = this._strokeWidth * dpi;
            ctx.strokeStyle = this._strokeColor;
            ctx.strokeText(
                this.content,
                left * dpi,
                (this._position.top - RENDER_OFFSET) * dpi,
            );
        }

        if (this._showCenter) {
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, 2 * dpi, 2 * dpi, 0, 0, 2 * Math.PI);
            ctx.fillStyle = 'blue';
            ctx.fill();
        }

        ctx.restore();
    }
}
