import { Drawable } from '@lib/draw/drawables/drawable';

export class Page {
    private drawables: Drawable[] = [];

    add(drawable: Drawable) {
        this.drawables.push(drawable);
    }

    // remove(drawableId: number) {
    //     this.drawables = this.drawables.filter(drawable => drawable.getId() !== drawableId);
    // }

    draw(ctx: CanvasRenderingContext2D, dpi: number) {
        for (const drawable of this.drawables) {
            drawable.draw(ctx, dpi);
        }
    }
}
