export class TextMeter {
    constructor(private ctx: CanvasRenderingContext2D, private font: string) {}

    measureText(text: string): TextMetrics {
        this.ctx.save();
        this.ctx.font = this.font;
        const textMetrics = this.ctx.measureText(text);
        this.ctx.restore();
        return textMetrics;
    }
}
