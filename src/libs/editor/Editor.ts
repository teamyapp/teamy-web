import { Command } from '@lib/editor/Command';
import { Attribute } from '@lib/editor/attribute/attribute';
import { IdGenerator, getNodeId } from '@lib/editor/id';
import { EditorRangeSelection } from '@lib/editor/selection/EditorRange.selection';

import { EditorNode } from './node/Editor.node';
import { RootNode } from './node/Root.node';
import { DOMSelection, EditorSelection } from './selection/Selection';

interface EventHandlers {
    onSelectionChange?: () => void;
}

export class Editor {
    private containerDOM?: HTMLElement;
    private rootNode: EditorNode;
    private selection?: EditorSelection;

    constructor(private eventHandlers?: EventHandlers) {
        const idGenerator = new IdGenerator();
        this.rootNode = new RootNode(idGenerator, idGenerator.generateId());
    }

    render(containerDOM: HTMLElement) {
        this.containerDOM = containerDOM;
        containerDOM.appendChild(this.rootNode.getOrCreateDOM());
        document.addEventListener(
            'selectionchange',
            this.onDocumentSelectionChange,
        );
    }

    executeCommand(command: Command): void {
        const result = this.rootNode.executeCommand(command, this.selection);
        result.selection?.selectDOM();
    }

    collectAttributesFromSelection(
        attributeNames: string[],
    ): Record<string, Attribute<any>> {
        return this.selection?.collectAttributes(attributeNames) || {};
    }

    dispose() {
        document.removeEventListener(
            'selectionchange',
            this.onDocumentSelectionChange,
        );

        const rootDOM = this.rootNode.getOrCreateDOM();
        if (rootDOM) {
            this.containerDOM?.removeChild(rootDOM);
            this.rootNode.dispose!();
        }
    }

    private onDocumentSelectionChange = () => {
        const domSelection = getDOMSelection();
        if (!domSelection) {
            return;
        }

        // TODO: support other types of selections
        this.selection = new EditorRangeSelection(
            domSelection.startEditorNodeId,
            domSelection.startDOMOffset,
            domSelection.endEditorNodeId,
            domSelection.endDOMOffset,
        );
        this.selection.findEditorNodes(this.rootNode);
        this.eventHandlers?.onSelectionChange?.call(null);
    };
}

function getDOMSelection(): DOMSelection | undefined {
    const domSelection = document.getSelection();
    if (!domSelection) {
        return;
    }

    let startDOMNode = domSelection.anchorNode;
    while (startDOMNode && startDOMNode.nodeType !== Node.ELEMENT_NODE) {
        startDOMNode = startDOMNode.parentNode;
    }

    if (startDOMNode === null) {
        return;
    }

    let endDOMNode = domSelection.focusNode;
    while (endDOMNode && endDOMNode.nodeType !== Node.ELEMENT_NODE) {
        endDOMNode = endDOMNode.parentNode;
    }

    if (endDOMNode === null) {
        return;
    }

    const startDOMElement = startDOMNode as HTMLElement;
    const startEditorNodeId = getNodeId(startDOMElement);
    if (!startEditorNodeId) {
        return;
    }

    const endDOMElement = endDOMNode as HTMLElement;
    const endEditorNodeId = getNodeId(endDOMElement);
    if (!endEditorNodeId) {
        return;
    }

    if (isSelectionBackward(startDOMElement, endDOMElement, domSelection)) {
        return {
            startEditorNodeId: endEditorNodeId,
            startDOMElement: endDOMElement,
            startDOMOffset: domSelection.focusOffset,
            endEditorNodeId: startEditorNodeId,
            endDOMElement: startDOMElement,
            endDOMOffset: domSelection.anchorOffset,
        };
    }

    return {
        startEditorNodeId,
        startDOMElement,
        startDOMOffset: domSelection.anchorOffset,
        endEditorNodeId,
        endDOMElement,
        endDOMOffset: domSelection.focusOffset,
    };
}

function isSelectionBackward(
    startDOMElement: HTMLElement,
    endDOMElement: HTMLElement,
    domSelection: Selection,
) {
    const position = startDOMElement.compareDocumentPosition(endDOMElement);
    return (
        position === Node.DOCUMENT_POSITION_PRECEDING ||
        (position === 0 && domSelection.anchorOffset > domSelection.focusOffset)
    );
}
