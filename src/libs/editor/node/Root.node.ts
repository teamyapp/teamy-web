import { Command } from '@lib/editor/Command';
import { Attribute } from '@lib/editor/attribute/attribute';
import { IdGenerator, withNodeId } from '@lib/editor/id';
import { formatSelectedKeys } from '@lib/editor/style';

import { EditorSelection } from '../selection/Selection';
import {
    DOMNodePosition,
    EditorNode,
    ExecuteCommandResult,
    executeCommandOnChildren,
} from './Editor.node';
import styles from './Root.module.scss';
import { TextNode } from './Text.node';

export class RootNode implements EditorNode {
    private domElement?: HTMLElement;
    private children: EditorNode[];
    private readonly classNames: Record<string, boolean>;

    constructor(private idGenerator: IdGenerator, private readonly id: number) {
        this.classNames = {};

        // TODO: remove sample data
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
            this.classNames[styles.Root] = true;
            this.domElement.className = formatSelectedKeys(this.classNames);

            this.children.forEach((childNode: EditorNode) => {
                const childDOM = childNode.getOrCreateDOM();
                this.domElement?.appendChild(childDOM);
            });

            // this.registerEvents();
        }

        return this.domElement;
    }

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): ExecuteCommandResult {
        const result = executeCommandOnChildren(
            this.domElement!,
            this.children,
            command,
            selection,
        );
        this.children = result.nodes;
        return result;
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

    dispose() {
        this.domElement = undefined;
    }

    getDOMNodePosition(offset: number): DOMNodePosition {
        throw new Error('not implemented');
    }

    collectAttributes(attributeNames: string[]): Attribute<any>[] {
        return [];
    }
}
