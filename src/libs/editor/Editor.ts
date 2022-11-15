import { Color } from '@lib/editor/Color';
import {
    setTextColorCommand,
    toggleTextBoldFormatCommand,
} from '@lib/editor/Command';
import { IdGenerator } from '@lib/editor/id';

import { EditorNode } from './nodes/Editor.node';
import { RootNode } from './nodes/Root.node';
import { EditorRangeSelection } from './selection/EditorRange.selection';
import { EditorSelection } from './selection/Selection';

export class Editor {
    private containerDOM?: HTMLElement;
    private rootDOM?: HTMLElement;
    private rootNode: EditorNode;
    private selection?: EditorSelection;

    // TODO: remove this. Added for testing only.
    private executed: boolean = false;

    constructor() {
        const idGenerator = new IdGenerator();
        this.rootNode = new RootNode(idGenerator, idGenerator.generateId());
    }

    render(containerDOM: HTMLElement) {
        this.containerDOM = containerDOM;
        this.rootDOM = this.rootNode.getOrCreateDOM();
        containerDOM.appendChild(this.rootDOM);

        // TODO: remove this
        // Simulate formatting words.
        if (!this.executed) {
            this.executed = true;
            setTimeout(() => {
                this.selection = new EditorRangeSelection(1, 1, 1, 10);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    toggleTextBoldFormatCommand(),
                    this.selection,
                );
            }, 2000);

            setTimeout(() => {
                this.selection = new EditorRangeSelection(2, 2, 2, 7);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    setTextColorCommand(new Color(194, 24, 91)),
                    this.selection,
                );
            }, 4000);

            setTimeout(() => {
                this.selection = new EditorRangeSelection(6, 0, 6, 0);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    setTextColorCommand(new Color(76, 175, 80)),
                    this.selection,
                );

                this.selection = new EditorRangeSelection(8, 0, 8, 0);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    toggleTextBoldFormatCommand(),
                    this.selection,
                );

                this.selection = new EditorRangeSelection(7, 1, 7, 1);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    setTextColorCommand(new Color(76, 175, 80)),
                    this.selection,
                );

                this.selection = new EditorRangeSelection(10, 0, 10, 0);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    toggleTextBoldFormatCommand(),
                    this.selection,
                );
            }, 6000);

            setTimeout(() => {
                this.selection = new EditorRangeSelection(8, 0, 8, 0);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    setTextColorCommand(new Color(0, 0, 0)),
                    this.selection,
                );

                this.selection = new EditorRangeSelection(10, 0, 10, 0);
                this.selection.selectNodes(this.rootNode);
                this.rootNode.executeCommand(
                    setTextColorCommand(new Color(0, 0, 0)),
                    this.selection,
                );
            }, 8000);
        }
    }

    dispose() {
        if (this.rootDOM) {
            this.containerDOM?.removeChild(this.rootDOM);
        }
    }
}
