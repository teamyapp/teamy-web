import { Attribute } from '@lib/editor/attribute/attribute';

export const SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME = 'SUPERSCRIPT_FORMAT_ATTR';

export function superscriptFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
