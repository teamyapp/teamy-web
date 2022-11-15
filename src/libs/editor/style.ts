import { Color } from '@lib/editor/Color';

export function flattenClassNames(classNames: Map<string, boolean>): string {
    return Array.from(classNames.entries())
        .filter((entry: [string, boolean]) => entry[1])
        .map((entry: [string, boolean]) => entry[0])
        .join(' ');
}

export function toCssString(color: Color): string {
    return `rgba(${color.red},${color.green},${color.blue},${color.alpha})`;
}
