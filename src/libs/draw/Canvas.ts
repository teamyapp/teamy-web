import { Page } from '@lib/draw/page';

export class Canvas {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly pages: Page[] = [];
    private readonly activePageIndex: number = 0;
    private selectedDrawableId?: number;

    constructor(private readonly canvasEl: HTMLCanvasElement) {
        this.ctx = canvasEl.getContext('2d')!;
        const defaultPage = new Page();
        this.pages.push(defaultPage);
    }

    public get context(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public clearAndDraw() {
        this.clearCanvas();
        const dpi = window.devicePixelRatio;
        const canvasRect = this.canvasEl.getBoundingClientRect();
        this.canvasEl.width = canvasRect.width * dpi;
        this.canvasEl.height = canvasRect.height * dpi;
        this.drawPage(dpi);
    }

    public getPage(pageIndex: number): Page {
        return this.pages[pageIndex];
    }

    private drawPage(dpi: number) {
        this.pages[this.activePageIndex].draw(this.ctx, dpi);
    }

    private clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }
}
