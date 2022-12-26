import { Page } from '@lib/draw/page';

export class Canvas {
    private readonly ctx: CanvasRenderingContext2D;
    private readonly pages: Page[] = [];
    private readonly activePageIndex: number = 0;
    private readonly dpi: number;
    private selectedDrawableId?: number;

    constructor(private readonly canvasEl: HTMLCanvasElement) {
        this.dpi = window.devicePixelRatio;
        this.ctx = canvasEl.getContext('2d')!;
        const defaultPage = new Page();
        this.pages.push(defaultPage);
        this.resize();
    }

    public get context(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public resize() {
        const parentRect = this.canvasEl.parentElement?.getBoundingClientRect();
        this.canvasEl.width = (parentRect?.width || document.documentElement.offsetWidth) * this.dpi;
        this.canvasEl.height = (parentRect?.height || document.documentElement.offsetHeight) * this.dpi;
    }

    public clearAndDraw() {
        this.clearCanvas();
        this.drawPage(this.dpi);
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
