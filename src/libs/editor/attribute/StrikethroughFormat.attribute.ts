import { Attribute } from '@lib/editor/attribute/attribute';

export const STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME = 'STRIKETHROUGH_FORMAT_ATTR';

export function strikethroughFormatAttribute(): Attribute<boolean> {
    return new Attribute<boolean>(
        STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME,
        false,
        false,
        (curr: boolean, other: boolean) => {
            return curr === other;
        },
    );
}
