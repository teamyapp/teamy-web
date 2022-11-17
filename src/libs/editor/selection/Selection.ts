import { Attribute } from '@lib/editor/attribute/attribute';

import { EditorNode } from '../node/Editor.node';

export interface DOMSelection {
    startEditorNodeId: number;
    startDOMElement: HTMLElement;
    startDOMOffset: number;
    endEditorNodeId: number;
    endDOMElement: HTMLElement;
    endDOMOffset: number;
}

export interface SelectedRange {
    startOffset: number;
    endOffset: number;
}

export interface EditorSelection {
    findEditorNodes(root: EditorNode): void;

    collectAttributes(attributeNames: string[]): Record<string, Attribute<any>>;

    selectDOM(): void;

    getSelectedRange(nodeId: number): SelectedRange | undefined;

    updateNode(
        oldNodeId: number,
        newNode: EditorNode,
        newStartOffset?: number,
        newEndOffset?: number,
    ): void;

    clone(): EditorSelection;
}
