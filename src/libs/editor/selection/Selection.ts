import { EditorNode } from '../nodes/Editor.node';

export interface SelectedRange {
    startOffset: number;
    endOffset: number;
}

export interface EditorSelection {
    selectNodes(root: EditorNode): void;

    getSelectedRange(nodeId: number): SelectedRange | undefined;
}
