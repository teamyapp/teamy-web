import { Attribute } from '@lib/editor/attribute/attribute';

export const ITALIC_FORMAT_ATTRIBUTE_NAME = 'ITALIC_FORMAT_ATTR';

export function italicFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        ITALIC_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
