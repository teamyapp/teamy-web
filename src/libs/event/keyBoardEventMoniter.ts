import { chan, multi, PopChannel } from "@lib/csp/csp";
type KeyboardEventType = 'keydown' | 'keyup';

export interface InternalKeyboardEvent {
    event: KeyboardEventType,
    key: string
    metaKey?: boolean
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>()
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan)
    private holdKeySet = new Set<string>()

    private onKeyUp = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keyup",
            metaKey: event.metaKey
        })
        document.addEventListener('keydown', this.onKeyDown, {once: true});
        this.holdKeySet.delete(event.key)
    }

    private onKeyDown = (event: KeyboardEvent) => {
        this.keyEventChan.put({
            key: event.key,
            event: "keydown",
            metaKey: event.metaKey
        })

        this.holdKeySet.add(event.key)
    }

    public subscribe(): PopChannel<InternalKeyboardEvent | undefined> {
        return this.keyEventMultiChan.copy()
    }

    public start() {
        document.addEventListener('keydown', this.onKeyDown, {once: true});
        document.addEventListener('keyup', this.onKeyUp);
    }

    public stop() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    public isKeyHold(key: string): boolean {
        return this.holdKeySet.has(key)
    }
}
