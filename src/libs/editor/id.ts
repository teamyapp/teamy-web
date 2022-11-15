const EDITOR_NODE_ID_ATTR = 'editorNodeId';

export class IdGenerator {
    constructor(private nextId: number = 0) {}

    public generateId(): number {
        const id = this.nextId;
        this.nextId++;
        return id;
    }
}

export function withNodeId(domElement: HTMLElement, nodeId: number): void {
    domElement.dataset[EDITOR_NODE_ID_ATTR] = `${nodeId}`;
}

export function getNodeId(domElement: HTMLElement): number | undefined {
    const nodeIdStr = domElement.dataset[EDITOR_NODE_ID_ATTR];
    if (!nodeIdStr) {
        return;
    }

    return Number(nodeIdStr);
}
