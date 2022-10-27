import { chan, multi } from "@lib/csp/csp";


type KeyboardEventType = keyof Pick<DocumentEventMap, "keydown" | "keyup">




export interface KeyboardEventEle {
    event: KeyboardEventType,
    key: string
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<KeyboardEventEle>()
    private keyEventMultiChan = multi<KeyboardEventEle>(this.keyEventChan)

    private keyupListener = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keyup"
        })
        
    }

    private keydownListener = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keydown"
        })

    }

    public subscribe() {
        return this.keyEventMultiChan.copy()
    }

    public start() {
        document.addEventListener('keydown', this.keydownListener);
        document.addEventListener('keyup', this.keyupListener);
    }

    public stop() {
        document.removeEventListener('keydown', this.keydownListener);
        document.removeEventListener('keyup', this.keyupListener);
    }
}
