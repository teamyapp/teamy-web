import { Color } from '@lib/editor/Color';
import { Attribute } from '@lib/editor/attribute/attribute';

export const TEXT_COLOR_ATTRIBUTE_NAME = 'TEXT_COLOR_ATTR';

export function textColorAttribute(): Attribute<Color> {
    return new Attribute<Color>(
        TEXT_COLOR_ATTRIBUTE_NAME,
        new Color(0, 0, 0),
        new Color(0, 0, 0),
        (curr: Color, other: Color) => {
            return curr.equals(other);
        },
    );
}
