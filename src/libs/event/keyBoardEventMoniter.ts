import { PopChannel, chan, multi } from '@lib/csp/csp';

type KeyboardEventType = 'keydown' | 'keyup';

type KeyboardKey = 'Control' | 'Meta';

const keyMap: Record<string, KeyboardKey> = {
    Control: 'Control',
};

export interface InternalKeyboardEvent {
    eventType: KeyboardEventType;
    key: KeyboardKey;
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>();
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan);
    private holdKeySet = new Set<KeyboardKey>();

    private onKeyUp = (event: KeyboardEvent) => {
        let keyboardKey: KeyboardKey
        if (!event.metaKey && this.isKeyHold('Meta')) {
            keyboardKey = 'Meta'
        } else {
            keyboardKey = keyMap[event.key]
        }

        if (keyboardKey) {
            this.holdKeySet.delete(keyboardKey);
            this.keyEventChan.put({
                key: keyboardKey,
                eventType: 'keyup',
            });
        }
    };

    private onKeyDown = (event: KeyboardEvent) => {
        let keyboardKey: KeyboardKey
        if (event.metaKey && !this.isKeyHold('Meta')) {
            keyboardKey = 'Meta';
        } else {
            keyboardKey = keyMap[event.key]
        }

        if (keyboardKey === undefined || this.isKeyHold(keyboardKey)) {
            return;
        }

        this.holdKeySet.add(keyboardKey);
        this.keyEventChan.put({
            key: keyboardKey,
            eventType: 'keydown',
        });
    };

    public subscribe(): PopChannel<InternalKeyboardEvent | undefined> {
        return this.keyEventMultiChan.copy();
    }

    public start() {
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
    }

    public stop() {
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
    }

    public isKeyHold(key: KeyboardKey): boolean {
        return this.holdKeySet.has(key);
    }
}
