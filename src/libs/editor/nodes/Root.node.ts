import { Command } from '@lib/editor/Command';
import { IdGenerator, withNodeId } from '@lib/editor/id';
import { flattenClassNames } from '@lib/editor/style';

import { EditorSelection } from '../selection/Selection';
import { EditorNode, executeCommandOnChildren } from './Editor.node';
import styles from './Root.module.scss';
import { TextNode } from './Text.node';

export class RootNode implements EditorNode {
    private domElement?: HTMLElement;
    private children: EditorNode[];
    private readonly classNames: Map<string, boolean>;

    constructor(private idGenerator: IdGenerator, private readonly id: number) {
        this.classNames = new Map<string, boolean>();
        const textNode1 = new TextNode(
            this.idGenerator,
            idGenerator.generateId(),
            'Hello, world!',
        );
        this.children = [textNode1];
    }

    getId(): number {
        return this.id;
    }

    getOrCreateDOM(): HTMLElement {
        if (!this.domElement) {
            this.domElement = document.createElement('div');
            withNodeId(this.domElement, this.id);

            this.domElement.contentEditable = 'true';
            this.classNames.set(styles.Root, true);
            this.domElement.className = flattenClassNames(this.classNames);

            this.children.forEach((childNode: EditorNode) => {
                const childDOM = childNode.getOrCreateDOM();
                this.domElement?.appendChild(childDOM);
            });
        }

        return this.domElement;
    }

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): EditorNode[] {
        this.children = executeCommandOnChildren(
            this.domElement!,
            this.children,
            command,
            selection,
        );
        return [this];
    }

    updateStyles(): void {
        return;
    }

    isContainer(): boolean {
        return true;
    }

    getChildren(): EditorNode[] {
        return this.children;
    }

    getContentSize(): number {
        return this.children.length;
    }

    tryMerge(child: EditorNode): EditorNode | undefined {
        return;
    }
}
