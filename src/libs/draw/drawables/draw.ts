export function rotate(ctx: CanvasRenderingContext2D, degree: number) {
    ctx.rotate((-degree * Math.PI) / 180);
}
