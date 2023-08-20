import { Color } from './Color';

export interface Command {
    name: string;
    payload?: any;
}

export const TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME = 'TOGGLE_TEXT_BOLD_FORMAT';

export function toggleTextBoldFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME,
    };
}

export const TOGGLE_TEXT_ITALIC_FORMAT_COMMAND_NAME =
    'TOGGLE_TEXT_ITALIC_FORMAT';

export function toggleTextItalicFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_ITALIC_FORMAT_COMMAND_NAME,
    };
}

export const TOGGLE_TEXT_UNDERLINED_FORMAT_COMMAND_NAME =
    'TOGGLE_TEXT_UNDERLINED_FORMAT';

export function toggleTextUnderlinedFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_UNDERLINED_FORMAT_COMMAND_NAME,
    };
}

export const TOGGLE_TEXT_STRIKETHROUGH_FORMAT_COMMAND_NAME =
    'TOGGLE_TEXT_STRIKETHROUGH_FORMAT';

export function toggleTextStrikethroughFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_STRIKETHROUGH_FORMAT_COMMAND_NAME,
    };
}

export const TOGGLE_TEXT_SUPERSCRIPT_FORMAT_COMMAND_NAME =
    'TOGGLE_TEXT_SUPERSCRIPT_FORMAT';

export function toggleTextSuperscriptFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_SUPERSCRIPT_FORMAT_COMMAND_NAME,
    };
}

export const TOGGLE_TEXT_SUBSCRIPT_FORMAT_COMMAND_NAME =
    'TOGGLE_TEXT_SUBSCRIPT_FORMAT';

export function toggleTextSubscriptFormatCommand(): Command {
    return {
        name: TOGGLE_TEXT_SUBSCRIPT_FORMAT_COMMAND_NAME,
    };
}

export const SET_TEXT_COLOR_COMMAND_NAME = 'SET_TEXT_COLOR';

export function setTextColorCommand(color: Color): Command {
    return {
        name: SET_TEXT_COLOR_COMMAND_NAME,
        payload: color,
    };
}
