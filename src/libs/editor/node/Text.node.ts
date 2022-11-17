import { Color } from '@lib/editor/Color';
import {
    Command,
    SET_TEXT_COLOR_COMMAND_NAME,
    TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME,
    TOGGLE_TEXT_ITALIC_FORMAT_COMMAND_NAME,
    TOGGLE_TEXT_STRIKETHROUGH_FORMAT_COMMAND_NAME,
    TOGGLE_TEXT_SUBSCRIPT_FORMAT_COMMAND_NAME,
    TOGGLE_TEXT_SUPERSCRIPT_FORMAT_COMMAND_NAME,
    TOGGLE_TEXT_UNDERLINED_FORMAT_COMMAND_NAME,
} from '@lib/editor/Command';
import {
    BOLD_FORMAT_ATTRIBUTE_NAME,
    boldFormatAttribute,
} from '@lib/editor/attribute/BoldFormat.attribute';
import {
    ITALIC_FORMAT_ATTRIBUTE_NAME,
    italicFormatAttribute,
} from '@lib/editor/attribute/ItalicFormat.attribute';
import {
    STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME,
    strikethroughFormatAttribute,
} from '@lib/editor/attribute/StrikethroughFormat.attribute';
import {
    SUBSCRIPT_FORMAT_ATTRIBUTE_NAME,
    subscriptFormatAttribute,
} from '@lib/editor/attribute/SubscriptFormat.attribute';
import {
    TEXT_COLOR_ATTRIBUTE_NAME,
    textColorAttribute,
} from '@lib/editor/attribute/TextColor.attribute';
import {
    UNDERLINED_FORMAT_ATTRIBUTE_NAME,
    underlinedFormatAttribute,
} from '@lib/editor/attribute/UnderlineFormat.attribute';
import { Attribute } from '@lib/editor/attribute/attribute';
import { IdGenerator, withNodeId } from '@lib/editor/id';
import { formatSelectedKeys, toCssColorString } from '@lib/editor/style';

import {
    SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME,
    superscriptFormatAttribute,
} from '../attribute/SuperscriptFormat.attribute';
import { EditorSelection, SelectedRange } from '../selection/Selection';
import {
    DOMNodePosition,
    EditorNode,
    ExecuteCommandResult,
} from './Editor.node';
import styles from './Text.module.scss';

export class TextNode implements EditorNode {
    private domElement?: HTMLElement;
    private readonly classNames: Record<string, boolean>;

    private textColorAttr: Attribute<Color>;
    private boldFormatAttr: Attribute<boolean>;
    private italicFormatAttr: Attribute<boolean>;
    private underlinedFormatAttr: Attribute<boolean>;
    private strikethroughFormatAttr: Attribute<boolean>;
    private superscriptFormatAttribute: Attribute<boolean>;
    private subscriptFormatAttribute: Attribute<boolean>;

    constructor(
        private idGenerator: IdGenerator,
        private readonly id: number,
        private readonly textContent: string,
    ) {
        this.classNames = {};
        this.textColorAttr = textColorAttribute();
        this.boldFormatAttr = boldFormatAttribute();
        this.italicFormatAttr = italicFormatAttribute();
        this.underlinedFormatAttr = underlinedFormatAttribute();
        this.strikethroughFormatAttr = strikethroughFormatAttribute();
        this.superscriptFormatAttribute = superscriptFormatAttribute();
        this.subscriptFormatAttribute = subscriptFormatAttribute();
    }

    getId(): number {
        return this.id;
    }

    getOrCreateDOM(): HTMLElement {
        if (!this.domElement) {
            this.domElement = document.createElement('span');
            withNodeId(this.domElement, this.id);
            this.domElement.textContent = this.textContent;
            this.classNames[styles.Text] = true;
            this.updateStyles();
        }

        return this.domElement;
    }

    updateStyles(): void {
        if (!this.domElement) {
            return;
        }

        this.classNames[styles.Bold] = this.boldFormatAttr.getValue();
        this.classNames[styles.Italic] = this.italicFormatAttr.getValue();
        this.classNames[styles.Superscript] =
            this.superscriptFormatAttribute.getValue();
        this.classNames[styles.Subscript] =
            this.subscriptFormatAttribute.getValue();
        this.domElement.className = formatSelectedKeys(this.classNames);

        this.domElement.style.textDecoration = formatSelectedKeys({
            underline: this.underlinedFormatAttr.getValue(),
            'line-through': this.strikethroughFormatAttr.getValue(),
        });
        this.domElement.style.color = toCssColorString(
            this.textColorAttr.getValue(),
        );
    }

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): ExecuteCommandResult {
        const selectedRange = selection?.getSelectedRange(this.id);
        switch (command.name) {
            case SET_TEXT_COLOR_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.textColorAttr.setValue(command.payload);
                    },
                );
            case TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.boldFormatAttr.setValue(
                            !this.boldFormatAttr.getValue(),
                        );
                    },
                );
            case TOGGLE_TEXT_ITALIC_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.italicFormatAttr.setValue(
                            !this.italicFormatAttr.getValue(),
                        );
                    },
                );
            case TOGGLE_TEXT_UNDERLINED_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.underlinedFormatAttr.setValue(
                            !this.underlinedFormatAttr.getValue(),
                        );
                    },
                );
            case TOGGLE_TEXT_STRIKETHROUGH_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.strikethroughFormatAttr.setValue(
                            !this.strikethroughFormatAttr.getValue(),
                        );
                    },
                );
            case TOGGLE_TEXT_SUPERSCRIPT_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.superscriptFormatAttribute.setValue(
                            !this.superscriptFormatAttribute.getValue(),
                        );
                    },
                );
            case TOGGLE_TEXT_SUBSCRIPT_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selection,
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.subscriptFormatAttribute.setValue(
                            !this.subscriptFormatAttribute.getValue(),
                        );
                    },
                );
        }

        return {
            nodes: [this],
            selection: selection,
        };
    }

    isContainer(): boolean {
        return false;
    }

    getContentSize(): number {
        return this.textContent.length;
    }

    tryMerge(other: EditorNode): EditorNode | undefined {
        if (!(other instanceof TextNode)) {
            return;
        }

        if (!this.hasSameStyles(other)) {
            return;
        }

        return this.clone(this.textContent + other.textContent);
    }

    getDOMNodePosition(offset: number): DOMNodePosition {
        return {
            domNode: this.domElement!.childNodes[0],
            offset: offset,
        };
    }

    collectAttributes(attributeNames: string[]): Attribute<any>[] {
        const attributes: Attribute<any>[] = [];
        const attributeNameSet = new Set<string>(attributeNames);

        if (attributeNameSet.has(TEXT_COLOR_ATTRIBUTE_NAME)) {
            attributes.push(this.textColorAttr.clone());
        }

        if (attributeNameSet.has(BOLD_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.boldFormatAttr.clone());
        }

        if (attributeNameSet.has(ITALIC_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.italicFormatAttr.clone());
        }

        if (attributeNameSet.has(UNDERLINED_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.underlinedFormatAttr.clone());
        }

        if (attributeNameSet.has(STRIKETHROUGH_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.strikethroughFormatAttr.clone());
        }

        if (attributeNameSet.has(SUPERSCRIPT_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.superscriptFormatAttribute.clone());
        }

        if (attributeNameSet.has(SUBSCRIPT_FORMAT_ATTRIBUTE_NAME)) {
            attributes.push(this.subscriptFormatAttribute.clone());
        }

        return attributes;
    }

    private hasSameStyles(other: TextNode): boolean {
        if (!this.boldFormatAttr.equals(other.boldFormatAttr)) {
            return false;
        }

        if (!this.italicFormatAttr.equals(other.italicFormatAttr)) {
            return false;
        }

        if (!this.underlinedFormatAttr.equals(other.underlinedFormatAttr)) {
            return false;
        }

        if (
            !this.strikethroughFormatAttr.equals(other.strikethroughFormatAttr)
        ) {
            return false;
        }

        if (
            !this.superscriptFormatAttribute.equals(
                other.superscriptFormatAttribute,
            )
        ) {
            return false;
        }

        if (
            !this.subscriptFormatAttribute.equals(
                other.subscriptFormatAttribute,
            )
        ) {
            return false;
        }

        if (!this.textColorAttr.equals(other.textColorAttr)) {
            return false;
        }

        return true;
    }

    private formatText(
        editorSelection: EditorSelection | undefined,
        selectedRange: SelectedRange | undefined,
        applyFormat: (newTextNode: TextNode) => void,
    ): ExecuteCommandResult {
        if (!selectedRange || !editorSelection) {
            return {
                nodes: [this],
                selection: editorSelection,
            };
        }

        if (selectedRange.startOffset === selectedRange.endOffset) {
            return {
                nodes: [this],
                selection: editorSelection,
            };
        }

        if (
            selectedRange.startOffset === 0 &&
            selectedRange.endOffset === this.textContent.length
        ) {
            applyFormat(this);
            return {
                nodes: [this],
                selection: editorSelection,
            };
        }

        const newNodes: EditorNode[] = [];
        const formattedText = this.textContent.slice(
            selectedRange.startOffset,
            selectedRange.endOffset,
        );
        const formattedNode = this.clone(formattedText);
        applyFormat(formattedNode);

        const newEditorSelection = editorSelection.clone();
        newEditorSelection.updateNode(
            this.id,
            formattedNode,
            0,
            formattedNode.textContent.length,
        );

        if (selectedRange.startOffset > 0) {
            const unchangedText = this.textContent.slice(
                0,
                selectedRange.startOffset,
            );
            const unchangedNode = this.clone(unchangedText);
            newNodes.push(unchangedNode);
        }

        newNodes.push(formattedNode);

        if (selectedRange.endOffset < this.textContent.length) {
            const unchangedText = this.textContent.slice(
                selectedRange.endOffset,
            );
            const unchangedNode = this.clone(unchangedText);
            newNodes.push(unchangedNode);
        }

        return {
            nodes: newNodes,
            selection: newEditorSelection,
        };
    }

    private clone(textContent: string): TextNode {
        const clonedNode = new TextNode(
            this.idGenerator,
            this.idGenerator.generateId(),
            textContent,
        );
        clonedNode.textColorAttr.setValue(this.textColorAttr.getValue());
        clonedNode.boldFormatAttr.setValue(this.boldFormatAttr.getValue());
        clonedNode.italicFormatAttr.setValue(this.italicFormatAttr.getValue());
        clonedNode.underlinedFormatAttr.setValue(
            this.underlinedFormatAttr.getValue(),
        );
        clonedNode.strikethroughFormatAttr.setValue(
            this.strikethroughFormatAttr.getValue(),
        );
        clonedNode.superscriptFormatAttribute.setValue(
            this.superscriptFormatAttribute.getValue(),
        );
        clonedNode.subscriptFormatAttribute.setValue(
            this.subscriptFormatAttribute.getValue(),
        );
        return clonedNode;
    }
}
