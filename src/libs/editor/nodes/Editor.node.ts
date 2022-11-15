import { Command } from '@lib/editor/Command';

import { EditorSelection } from '../selection/Selection';

export interface EditorNode {
    getId(): number;

    executeCommand(command: Command, selection?: EditorSelection): EditorNode[];

    isContainer(): boolean;

    getChildren?(): EditorNode[];

    getOrCreateDOM(): HTMLElement;

    updateStyles(): void;

    getContentSize(): number;

    tryMerge(child: EditorNode): EditorNode | undefined;
}

export function executeCommandOnChildren(
    parentDOM: HTMLElement,
    children: EditorNode[],
    command: Command,
    selection?: EditorSelection,
): EditorNode[] {
    let newChildren: EditorNode[] = children.flatMap((childNode) =>
        childNode.executeCommand(command, selection),
    );
    if (newChildren.length > 1) {
        const mergedChildren: EditorNode[] = [newChildren[0]];
        for (let index = 1; index < newChildren.length; index++) {
            const currChild = newChildren[index];
            const lastChild = mergedChildren[mergedChildren.length - 1];
            const mergedChild = lastChild.tryMerge(currChild);
            if (mergedChild) {
                mergedChildren[mergedChildren.length - 1] = mergedChild;
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

    return newChildren;
}
