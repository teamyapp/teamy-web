import { Color } from '@lib/editor/Color';
import {
    Command,
    SET_TEXT_COLOR_COMMAND_NAME,
    TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME,
} from '@lib/editor/Command';
import { IdGenerator, withNodeId } from '@lib/editor/id';
import { flattenClassNames, toCssString } from '@lib/editor/style';

import { EditorSelection, SelectedRange } from '../selection/Selection';
import { EditorNode } from './Editor.node';
import styles from './Text.module.scss';

export class TextNode implements EditorNode {
    private textColor: Color;
    private isBold: boolean;
    private domElement?: HTMLElement;
    private readonly classNames: Map<string, boolean>;

    constructor(
        private idGenerator: IdGenerator,
        private readonly id: number,
        private readonly textContent: string,
    ) {
        this.textColor = new Color(0, 0, 0, 1);
        this.isBold = false;
        this.classNames = new Map<string, boolean>();
    }

    getId(): number {
        return this.id;
    }

    getOrCreateDOM(): HTMLElement {
        if (!this.domElement) {
            this.domElement = document.createElement('span');
            withNodeId(this.domElement, this.id);
            this.domElement.textContent = this.textContent;
            this.classNames.set(styles.Text, true);
            this.updateStyles();
        }

        return this.domElement;
    }

    updateStyles(): void {
        if (!this.domElement) {
            return;
        }

        this.classNames.set(styles.Bold, this.isBold);
        this.domElement.className = flattenClassNames(this.classNames);
        this.domElement.style.color = toCssString(this.textColor);
        console.log(this.textColor);
    }

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): EditorNode[] {
        const selectedRange = selection?.getSelectedRange(this.id);
        switch (command.name) {
            case TOGGLE_TEXT_BOLD_FORMAT_COMMAND_NAME:
                return this.formatText(
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.isBold = !this.isBold;
                    },
                );
            case SET_TEXT_COLOR_COMMAND_NAME:
                return this.formatText(
                    selectedRange,
                    (newTextNode: TextNode) => {
                        newTextNode.textColor = command.payload;
                    },
                );
        }

        return [this];
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

    private hasSameStyles(other: TextNode): boolean {
        if (this.isBold !== other.isBold) {
            return false;
        }

        if (!this.textColor.equals(other.textColor)) {
            return false;
        }

        return true;
    }

    private formatText(
        selectedRange: SelectedRange | undefined,
        applyFormat: (newTextNode: TextNode) => void,
    ): EditorNode[] {
        if (!selectedRange) {
            return [this];
        }

        if (
            selectedRange.startOffset === 0 &&
            selectedRange.endOffset === this.textContent.length - 1
        ) {
            applyFormat(this);
            return [this];
        }

        const newNodes: EditorNode[] = [];
        const formattedText = this.textContent.slice(
            selectedRange.startOffset,
            selectedRange.endOffset + 1,
        );
        const formattedNode = this.clone(formattedText);
        applyFormat(formattedNode);

        if (selectedRange.startOffset > 0) {
            const unchangedText = this.textContent.slice(
                0,
                selectedRange.startOffset,
            );
            const unchangedNode = this.clone(unchangedText);
            newNodes.push(unchangedNode);
        }

        newNodes.push(formattedNode);

        if (selectedRange.endOffset < this.textContent.length - 1) {
            const unchangedText = this.textContent.slice(
                selectedRange.endOffset + 1,
            );
            const unchangedNode = this.clone(unchangedText);
            newNodes.push(unchangedNode);
        }

        return newNodes;
    }

    private clone(textContent: string): TextNode {
        const clonedNode = new TextNode(
            this.idGenerator,
            this.idGenerator.generateId(),
            textContent,
        );
        clonedNode.isBold = this.isBold;
        clonedNode.textColor = this.textColor;
        return clonedNode;
    }
}
