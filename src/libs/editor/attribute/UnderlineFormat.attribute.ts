import { Attribute } from '@lib/editor/attribute/attribute';

export const UNDERLINED_FORMAT_ATTRIBUTE_NAME = 'UNDERLINED_FORMAT_ATTR';

export function underlinedFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        UNDERLINED_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
