import { Color } from '@lib/editor/Color';

export function formatSelectedKeys(record: Record<string, boolean>): string {
    return Object.keys(record)
        .filter((key) => record[key])
        .join(' ');
}

export function toCssColorString(color: Color): string {
    return `rgba(${color.red},${color.green},${color.blue},${color.alpha})`;
}
