import { EditorNode } from '../nodes/Editor.node';
import { EditorSelection, SelectedRange } from './Selection';

export class EditorRangeSelection implements EditorSelection {
    private shouldCollectNode: boolean;
    private readonly selectedNodes: Map<number, EditorNode>;
    private readonly selectedNodeIds: number[];

    constructor(
        private startNodeId: number,
        private startChildOffset: number,
        private endNodeId: number,
        private endChildOffset: number,
    ) {
        this.shouldCollectNode = false;
        this.selectedNodeIds = [];
        this.selectedNodes = new Map<number, EditorNode>();
    }

    selectNodes(root: EditorNode): void {
        this.collectLeaves(root);
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
        this.selectedNodeIds.push(nodeId);
        this.selectedNodes.set(nodeId, node);
    }

    getSelectedRange(nodeId: number): SelectedRange | undefined {
        const node = this.selectedNodes.get(nodeId);
        if (!node) {
            return;
        }

        let startOffset = 0;
        let endOffset = node.getContentSize() - 1;

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
}
