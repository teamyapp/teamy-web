import { Command } from '@lib/editor/Command';
import { Attribute } from '@lib/editor/attribute/attribute';
import { IdGenerator } from '@lib/editor/id';
import { formatSelectedKeys } from '@lib/editor/style';

import { EditorSelection } from '../selection/Selection';
import {
    DOMNodePosition,
    EditorNode,
    ExecuteCommandResult,
} from './Editor.node';
import styles from './Heading.module.scss';

type HeadingSize = 1 | 2 | 3 | 4 | 5 | 6;

const SIZE_TO_HEADING_TAG: Record<HeadingSize, string> = {
    1: 'h1',
    2: 'h2',
    3: 'h3',
    4: 'h4',
    5: 'h5',
    6: 'h6',
};

export class HeadingNode implements EditorNode {
    private size: HeadingSize;
    private domElement?: HTMLElement;
    private children: EditorNode[];
    private readonly classNames: Record<string, boolean>;

    constructor(
        private idGenerator: IdGenerator,
        private readonly id: number,
    ) {
        this.size = 1;
        this.children = [];
        this.classNames = {};
    }

    getId(): number {
        return this.id;
    }

    getOrCreateDOM(): HTMLElement {
        if (!this.domElement) {
            this.domElement = document.createElement(
                SIZE_TO_HEADING_TAG[this.size],
            );
            this.classNames[styles.Heading] = true;
            this.domElement.className = formatSelectedKeys(this.classNames);
        }

        return this.domElement;
    }

    updateStyles(): void {
        return;
    }

    executeCommand(
        command: Command,
        selection?: EditorSelection,
    ): ExecuteCommandResult {
        return {
            nodes: [this],
            selection: selection,
        };
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

    getDOMNodePosition(offset: number): DOMNodePosition {
        throw new Error('not implemented');
    }

    collectAttributes(attributeNames: string[]): Attribute<any>[] {
        return [];
    }
}
