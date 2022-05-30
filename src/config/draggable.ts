import { Size, SizeTransformer } from '@lib/dragAndDrop/size';

export const draggableTask = 'task';

export function sectionItemSizeTransformer(
    containerSize: Size,
): SizeTransformer {
    return (taskPreviewSize: Size) => ({
        width: containerSize.width - 30,
        height: taskPreviewSize.height,
    });
}
