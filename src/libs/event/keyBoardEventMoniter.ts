import { chan, multi } from "@lib/csp/csp";

type KeyboardEventType = keyof Pick<DocumentEventMap, "keydown" | "keyup">

export interface CustomKeyboardEvent {
    event: KeyboardEventType,
    key: string
    metaKey?: boolean
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<CustomKeyboardEvent>()
    private keyEventMultiChan = multi<CustomKeyboardEvent>(this.keyEventChan)

    private onKeyUp = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keyup",
            metaKey: event.metaKey
        })
        this.addKeyDownListener()
    }

    private onKeyDown = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keydown",
            metaKey: event.metaKey
        })
    }

    private addKeyDownListener() {
        document.addEventListener('keydown', this.onKeyDown, {once: true});
    }

    public subscribe() {
        return this.keyEventMultiChan.copy()
    }

    public start() {
        this.addKeyDownListener()
        document.addEventListener('keyup', this.onKeyUp);
    }

    public stop() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }
}
