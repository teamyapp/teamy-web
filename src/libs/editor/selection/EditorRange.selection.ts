import { Attribute } from '@lib/editor/attribute/attribute';

import { EditorNode } from '../node/Editor.node';
import { EditorSelection, SelectedRange } from './Selection';

export class EditorRangeSelection implements EditorSelection {
    private shouldCollectNode: boolean;
    private startEditorNode?: EditorNode;
    private endEditorNode?: EditorNode;

    constructor(
        private startNodeId: number,
        private startChildOffset: number,
        private endNodeId: number,
        private endChildOffset: number,
        private selectedNodes?: Map<number, EditorNode>,
    ) {
        this.shouldCollectNode = false;
    }

    updateNode(
        oldNodeId: number,
        newNode: EditorNode,
        newStartOffset?: number,
        newEndOffset?: number,
    ): void {
        if (!this.selectedNodes?.has(oldNodeId)) {
            return;
        }

        this.selectedNodes.delete(oldNodeId);
        this.selectedNodes.set(newNode.getId(), newNode);

        if (oldNodeId === this.startNodeId) {
            this.startNodeId = newNode.getId();
            this.startEditorNode = newNode;

            if (newStartOffset !== undefined) {
                this.startChildOffset = newStartOffset;
            }
        }

        if (oldNodeId === this.endNodeId) {
            this.endNodeId = newNode.getId();
            this.endEditorNode = newNode;

            if (newEndOffset !== undefined) {
                this.endChildOffset = newEndOffset;
            }
        }
    }

    findEditorNodes(root: EditorNode): void {
        this.shouldCollectNode = false;
        this.selectedNodes = new Map<number, EditorNode>();
        this.collectLeaves(root);
        this.startEditorNode = this.selectedNodes.get(this.startNodeId);
        this.endEditorNode = this.selectedNodes.get(this.endNodeId);
    }

    selectDOM(): void {
        const domSelection = document.getSelection();
        if (!domSelection) {
            return;
        }

        if (domSelection.rangeCount > 0) {
            domSelection.removeAllRanges();
        }

        const range = document.createRange();
        if (this.startEditorNode) {
            const startEndpoint = this.startEditorNode.getDOMNodePosition(
                this.startChildOffset,
            );
            range.setStart(startEndpoint.domNode, startEndpoint.offset);
        }

        if (this.endEditorNode) {
            const endEndpoint = this.endEditorNode.getDOMNodePosition(
                this.endChildOffset,
            );
            range.setEnd(endEndpoint.domNode, endEndpoint.offset);
        }

        domSelection.addRange(range);
    }

    private collectLeaves(root: EditorNode) {
        const nodeId = root.getId();
        if (nodeId === this.startNodeId) {
            this.shouldCollectNode = true;
        }

        if (root.isContainer()) {
            root.getChildren?.call(root).forEach((childNode) => {
                this.collectLeaves(childNode);
            });
        } else if (this.shouldCollectNode) {
            this.collectNode(root);
        }

        if (nodeId === this.endNodeId) {
            this.shouldCollectNode = false;
        }
    }

    private collectNode(node: EditorNode) {
        const nodeId = node.getId();
        this.selectedNodes?.set(nodeId, node);
    }

    getSelectedRange(nodeId: number): SelectedRange | undefined {
        const node = this.selectedNodes?.get(nodeId);
        if (!node) {
            return;
        }

        let startOffset = 0;
        let endOffset = node.getContentSize();

        if (nodeId === this.startNodeId) {
            startOffset = this.startChildOffset;
        }

        if (nodeId === this.endNodeId) {
            endOffset = this.endChildOffset;
        }

        return {
            startOffset: startOffset,
            endOffset: endOffset,
        };
    }

    collectAttributes(
        attributeNames: string[],
    ): Record<string, Attribute<any>> {
        const attributes: Record<string, Attribute<any>> = {};
        this.selectedNodes?.forEach((node) => {
            node.collectAttributes(attributeNames).forEach((attribute) => {
                const prevAttr = attributes[attribute.name()];
                if (!prevAttr) {
                    attributes[attribute.name()] = attribute;
                    return;
                }

                attributes[attribute.name()] = prevAttr.tryMerge(attribute)!;
            });
        });
        return attributes;
    }

    clone(): EditorSelection {
        const selection = new EditorRangeSelection(
            this.startNodeId,
            this.startChildOffset,
            this.endNodeId,
            this.endChildOffset,
            this.selectedNodes,
        );
        selection.startEditorNode = this.startEditorNode;
        selection.endEditorNode = this.endEditorNode;
        return selection;
    }
}
