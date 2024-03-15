import { PopChannel, chan, multi } from '@lib/csp/csp';

type KeyboardEventType = 'keydown' | 'keyup';

type KeyboardKey = 'Control';

type InternalKeyboardKey = 'Control' | 'Meta';

const InternalToPublicKeyMap: Record<InternalKeyboardKey, KeyboardKey> = {
    Control: 'Control',
    Meta: 'Control',
};

const keyMap: Record<string, InternalKeyboardKey> = {
    Control: 'Control',
};

export interface InternalKeyboardEvent {
    eventType: KeyboardEventType;
    key: KeyboardKey;
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>();
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan);
    private holdKeySet = new Set<InternalKeyboardKey>();

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

    private isKeyHold(key: InternalKeyboardKey): boolean {
        return this.holdKeySet.has(key);
    }

    private onKeyUp = (event: KeyboardEvent) => {
        let internalKeyboardKey: InternalKeyboardKey;

        if (!event.metaKey && this.isKeyHold('Meta')) {
            internalKeyboardKey = 'Meta';
        } else {
            internalKeyboardKey = keyMap[event.key];
        }

        const publicKey = InternalToPublicKeyMap[internalKeyboardKey];

        if (publicKey) {
            this.holdKeySet.delete(internalKeyboardKey);
            this.keyEventChan.put({
                key: publicKey,
                eventType: 'keyup',
            });
        }
    };

    private onKeyDown = (event: KeyboardEvent) => {
        let internalKeyboardKey: InternalKeyboardKey;
        if (event.metaKey && !this.isKeyHold('Meta')) {
            internalKeyboardKey = 'Meta';
        } else {
            internalKeyboardKey = keyMap[event.key];
        }

        if (
            internalKeyboardKey === undefined ||
            this.isKeyHold(internalKeyboardKey)
        ) {
            return;
        }

        const publicKey = InternalToPublicKeyMap[internalKeyboardKey];

        if (publicKey) {
            this.holdKeySet.add(internalKeyboardKey);
            this.keyEventChan.put({
                key: publicKey,
                eventType: 'keydown',
            });
        }
    };
}
