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

export const SET_TEXT_COLOR_COMMAND_NAME = 'SET_TEXT_COLOR';

export function setTextColorCommand(color: Color): Command {
    return {
        name: SET_TEXT_COLOR_COMMAND_NAME,
        payload: color,
    };
}
