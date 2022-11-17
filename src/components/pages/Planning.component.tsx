import classNames from 'classnames';
import { Component, createRef } from 'react';

import { Color } from '@lib/editor/Color';
import {
    setTextColorCommand,
    toggleTextBoldFormatCommand,
    toggleTextItalicFormatCommand,
    toggleTextStrikethroughFormatCommand,
    toggleTextSubscriptFormatCommand,
    toggleTextSuperscriptFormatCommand,
    toggleTextUnderlinedFormatCommand,
} from '@lib/editor/Command';
import { Editor } from '@lib/editor/Editor';
import { BOLD_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/BoldFormat.attribute';
import { ITALIC_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/ItalicFormat.attribute';
import { STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/StrikethroughFormat.attribute';
import { SUBSCRIPT_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/SubscriptFormat.attribute';
import { SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/SuperscriptFormat.attribute';
import { TEXT_COLOR_ATTRIBUTE_NAME } from '@lib/editor/attribute/TextColor.attribute';
import { UNDERLINED_FORMAT_ATTRIBUTE_NAME } from '@lib/editor/attribute/UnderlineFormat.attribute';
import { toCssColorString } from '@lib/editor/style';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './Planning.component.module.scss';

interface State {
    textColor: Color;
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
    isBulletList: boolean;
    isNumberedList: boolean;
    isAlignedToLeft: boolean;
    isAlignedToCenter: boolean;
    isAlignedToRight: boolean;
}

export class PlanningComponent extends Component<any, State> {
    private editor: Editor;
    private planningEl = createRef<any>();

    constructor(props: any) {
        super(props);
        this.state = {
            textColor: new Color(0, 0, 0),
            isBold: false,
            isItalic: false,
            isUnderlined: false,
            isStrikethrough: false,
            isSuperscript: false,
            isSubscript: false,
            isBulletList: false,
            isNumberedList: false,
            isAlignedToLeft: false,
            isAlignedToCenter: false,
            isAlignedToRight: false,
        };
        this.editor = new Editor({
            onSelectionChange: this.onEditorSelectionChange,
        });
    }

    render() {
        return (
            <div className={styles.Planning}>
                <div className={styles.Document}>
                    <div className={styles.ActionBar}>
                        <div
                            className={`${styles.Action} ${styles.TextColorAction}`}
                            onClick={this.onTextColorActionClick}
                        >
                            <MaterialIconUI
                                color={toCssColorString(this.state.textColor)}
                            >
                                format_color_text
                            </MaterialIconUI>
                        </div>
                        <div
                            className={styles.Action}
                            onClick={this.onBackgroundColorActionClick}
                        >
                            <MaterialIconUI>format_color_fill</MaterialIconUI>
                        </div>
                        <div className={styles.Divider} />
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isBold,
                            })}`}
                            onClick={this.onBoldFormatActionClick}
                        >
                            <MaterialIconUI>format_bold</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isItalic,
                            })}`}
                            onClick={this.onItalicFormatActionClick}
                        >
                            <MaterialIconUI>format_italic</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isUnderlined,
                            })}`}
                            onClick={this.onUnderlinedFormatActionClick}
                        >
                            <MaterialIconUI>format_underlined</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isStrikethrough,
                            })}`}
                            onClick={this.onStrikeThroughFormatActionClick}
                        >
                            <MaterialIconUI>
                                format_strikethrough
                            </MaterialIconUI>
                        </div>
                        <div className={styles.Divider} />
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isSuperscript,
                            })}`}
                            onClick={this.onSuperscriptFormatActionClick}
                        >
                            <MaterialIconUI>superscript</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isSubscript,
                            })}`}
                            onClick={this.onSubscriptFormatActionClick}
                        >
                            <MaterialIconUI>subscript</MaterialIconUI>
                        </div>
                        <div className={styles.Divider} />
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isBulletList,
                            })}`}
                            onClick={this.onBulletListActionClick}
                        >
                            <MaterialIconUI>
                                format_list_bulleted
                            </MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isNumberedList,
                            })}`}
                            onClick={this.onNumberedListActionClick}
                        >
                            <MaterialIconUI>
                                format_list_numbered
                            </MaterialIconUI>
                        </div>
                        <div className={styles.Divider} />
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isAlignedToLeft,
                            })}`}
                            onClick={this.onAlignLeftActionClick}
                        >
                            <MaterialIconUI>format_align_left</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isAlignedToCenter,
                            })}`}
                            onClick={this.onAlignCenterActionClick}
                        >
                            <MaterialIconUI>format_align_center</MaterialIconUI>
                        </div>
                        <div
                            className={`${styles.Action} ${classNames({
                                [styles.Active]: this.state.isAlignedToRight,
                            })}`}
                            onClick={this.onAlignRightActionClick}
                        >
                            <MaterialIconUI>format_align_right</MaterialIconUI>
                        </div>
                    </div>
                    <div ref={this.planningEl} className={styles.Planning} />
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.editor.render(this.planningEl.current);
    }

    componentWillUnmount() {
        this.editor.dispose();
    }

    private onTextColorActionClick = () => {
        this.editor.executeCommand(setTextColorCommand(new Color(194, 24, 91)));
    };

    private onBackgroundColorActionClick = () => {};

    private onBoldFormatActionClick = () => {
        this.editor.executeCommand(toggleTextBoldFormatCommand());
    };

    private onItalicFormatActionClick = () => {
        this.editor.executeCommand(toggleTextItalicFormatCommand());
    };

    private onUnderlinedFormatActionClick = () => {
        this.editor.executeCommand(toggleTextUnderlinedFormatCommand());
    };

    private onStrikeThroughFormatActionClick = () => {
        this.editor.executeCommand(toggleTextStrikethroughFormatCommand());
    };

    private onSuperscriptFormatActionClick = () => {
        this.editor.executeCommand(toggleTextSuperscriptFormatCommand());
    };

    private onSubscriptFormatActionClick = () => {
        this.editor.executeCommand(toggleTextSubscriptFormatCommand());
    };

    private onBulletListActionClick = () => {};

    private onNumberedListActionClick = () => {};

    private onAlignLeftActionClick = () => {};

    private onAlignCenterActionClick = () => {};

    private onAlignRightActionClick = () => {};

    private onEditorSelectionChange = () => {
        const attributes = this.editor.collectAttributesFromSelection([
            TEXT_COLOR_ATTRIBUTE_NAME,
            BOLD_FORMAT_ATTRIBUTE_NAME,
            ITALIC_FORMAT_ATTRIBUTE_NAME,
            UNDERLINED_FORMAT_ATTRIBUTE_NAME,
            STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME,
            SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME,
            SUBSCRIPT_FORMAT_ATTRIBUTE_NAME,
        ]);

        const textColor =
            attributes[TEXT_COLOR_ATTRIBUTE_NAME]?.getValue() ||
            new Color(0, 0, 0);
        const isBold =
            attributes[BOLD_FORMAT_ATTRIBUTE_NAME]?.getValue() || false;
        const isItalic =
            attributes[ITALIC_FORMAT_ATTRIBUTE_NAME]?.getValue() || false;
        const isUnderlined =
            attributes[UNDERLINED_FORMAT_ATTRIBUTE_NAME]?.getValue() || false;
        const isStrikethrough =
            attributes[STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME]?.getValue() ||
            false;
        const isSuperscript =
            attributes[SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME]?.getValue() || false;
        const isSubscript =
            attributes[SUBSCRIPT_FORMAT_ATTRIBUTE_NAME]?.getValue() || false;

        this.setState({
            textColor,
            isBold,
            isItalic,
            isUnderlined,
            isStrikethrough,
            isSuperscript,
            isSubscript,
        });
    };
}
