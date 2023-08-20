import { Command } from '@lib/editor/Command';
import { Attribute } from '@lib/editor/attribute/attribute';

import { EditorSelection } from '../selection/Selection';

export interface ExecuteCommandResult {
    nodes: EditorNode[];
    selection: EditorSelection | undefined;
}

export interface DOMNodePosition {
    domNode: Node;
    offset: number;
}

export interface EditorNode {
    getId(): number;

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): ExecuteCommandResult;

    isContainer(): boolean;

    getChildren?(): EditorNode[];

    getOrCreateDOM(): HTMLElement;

    getDOMNodePosition(offset: number): DOMNodePosition;

    updateStyles(): void;

    getContentSize(): number;

    tryMerge(child: EditorNode): EditorNode | undefined;

    collectAttributes(attributeNames: string[]): Attribute<any>[];

    dispose?(): void;
}

export function executeCommandOnChildren(
    parentDOM: HTMLElement,
    children: EditorNode[],
    command: Command,
    selection?: EditorSelection,
): ExecuteCommandResult {
    let newChildren: EditorNode[] = [];
    let newSelection = selection?.clone();
    children.forEach((childNode) => {
        const result = childNode.executeCommand(command, newSelection);
        newChildren.push(...result.nodes);
        newSelection = result.selection;
    });

    if (newChildren.length > 1) {
        const mergedChildren: EditorNode[] = [newChildren[0]];
        for (let index = 1; index < newChildren.length; index++) {
            const currChild = newChildren[index];
            const lastChild = mergedChildren[mergedChildren.length - 1];
            const mergedChild = lastChild.tryMerge(currChild);
            if (mergedChild) {
                mergedChildren[mergedChildren.length - 1] = mergedChild;

                const currChildId = currChild.getId();
                let selectedRange = newSelection?.getSelectedRange(currChildId);
                if (selectedRange) {
                    const newStartOffset =
                        lastChild.getContentSize() + selectedRange.startOffset;
                    const newEndOffset =
                        lastChild.getContentSize() + selectedRange.endOffset;
                    newSelection?.updateNode(
                        currChildId,
                        mergedChild,
                        newStartOffset,
                        newEndOffset,
                    );
                }

                selectedRange = newSelection?.getSelectedRange(
                    lastChild.getId(),
                );
                if (selectedRange) {
                    newSelection?.updateNode(lastChild.getId(), mergedChild);
                }
            } else {
                mergedChildren.push(currChild);
            }
        }

        newChildren = mergedChildren;
    }

    while (parentDOM.firstChild) {
        parentDOM.removeChild(parentDOM.firstChild);
    }

    newChildren.forEach((child) => {
        const childDOM = child.getOrCreateDOM();
        parentDOM.appendChild(childDOM);
        child.updateStyles();
    });

    return {
        nodes: newChildren,
        selection: newSelection,
    };
}
