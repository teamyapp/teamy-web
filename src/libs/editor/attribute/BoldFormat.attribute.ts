import { Attribute } from '@lib/editor/attribute/attribute';

export const BOLD_FORMAT_ATTRIBUTE_NAME = 'BOLD_FORMAT_ATTR';

export function boldFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        BOLD_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
