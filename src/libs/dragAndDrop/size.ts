export interface Size {
    width: number;
    height: number;
}

export type SizeTransformer = (itemSize: Size) => Size;

export const sizeUnchanged: SizeTransformer = (itemSize: Size) => itemSize;
