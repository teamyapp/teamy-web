import { PopChannel, chan, multi } from '@lib/csp/csp';

type KeyboardEventType = 'keydown' | 'keyup';

const KeyboardKeys = ['Control', 'Meta'] as const;
type KeyboardKey = typeof KeyboardKeys[number];

export interface InternalKeyboardEvent {
    eventType: KeyboardEventType;
    key: KeyboardKey;
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>();
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan);
    private holdKeySet = new Set<KeyboardKey>();

    private isOfTypeKeyboardKey(eventKey: string): eventKey is KeyboardKey {
        return (KeyboardKeys as readonly string[]).includes(eventKey);
    }

    private getKeyBoardKey(event: KeyboardEvent): null | KeyboardKey {
        if (event.metaKey) {
            return 'Meta';
        }

        if (this.isOfTypeKeyboardKey(event.key)) {
            return event.key;
        }

        return null;
    }

    private onKeyUp = (event: KeyboardEvent) => {
        const keyboardKey = this.getKeyBoardKey(event);
        if (keyboardKey) {
            this.keyEventChan.put({
                key: keyboardKey,
                eventType: 'keyup',
            });

            this.holdKeySet.delete(keyboardKey);
        }
    };

    private onKeyDown = (event: KeyboardEvent) => {
        const keyboardKey = this.getKeyBoardKey(event);
        if (keyboardKey === null || this.isKeyHold(keyboardKey)) {
            return;
        }

        this.keyEventChan.put({
            key: keyboardKey,
            eventType: 'keydown',
        });

        this.holdKeySet.add(keyboardKey);
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
