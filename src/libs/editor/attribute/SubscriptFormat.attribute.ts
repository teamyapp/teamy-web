import { Attribute } from '@lib/editor/attribute/attribute';

export const SUBSCRIPT_FORMAT_ATTRIBUTE_NAME = 'SUBSCRIPT_FORMAT_ATTR';

export function subscriptFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        SUBSCRIPT_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
