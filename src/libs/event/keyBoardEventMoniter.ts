import { PopChannel, chan, multi } from '@lib/csp/csp';

type KeyboardEventType = 'keydown' | 'keyup';

type KeyboardKey = 'Control' | 'Meta';

const keyMap: Record<string, KeyboardKey> = {
    Control: 'Control',
    Meta: 'Meta',
};

export interface InternalKeyboardEvent {
    eventType: KeyboardEventType;
    key: KeyboardKey;
}

export class KeyBoardEventMonitor {
    private keyEventChan = chan<InternalKeyboardEvent>();
    private keyEventMultiChan = multi<InternalKeyboardEvent>(this.keyEventChan);
    private holdKeySet = new Set<KeyboardKey>();

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

    private isKeyHold(key: KeyboardKey): boolean {
        return this.holdKeySet.has(key);
    }

    private onKeyUp = (event: KeyboardEvent) => {
        let keyboardKey: KeyboardKey;

        if (!event.metaKey && this.isKeyHold('Meta')) {
            keyboardKey = 'Meta';
        } else {
            keyboardKey = keyMap[event.key];
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
        let keyboardKey: KeyboardKey;
        if (event.metaKey && !this.isKeyHold('Meta')) {
            keyboardKey = 'Meta';
        } else {
            keyboardKey = keyMap[event.key];
        }

        if (keyboardKey === undefined || this.isKeyHold(keyboardKey)) {
            return;
        }

        if (keyboardKey) {
            this.holdKeySet.add(keyboardKey);
            this.keyEventChan.put({
                key: keyboardKey,
                eventType: 'keydown',
            });
        }
    };
}

export class ItemsSelector {
    private selectedItemKeys: Set<string> = new Set();
    private multiSelectionEnabled: boolean;
    private selectedItemsChangedChan = chan<Set<string>>();
    private selectedItemsEventMultiChan = multi<Set<string>>(
        this.selectedItemsChangedChan,
    );

    constructor(multiSelectionEnabled: boolean, selectedItemKeys: Set<string>) {
        this.multiSelectionEnabled = multiSelectionEnabled;
        this.selectedItemKeys = new Set(selectedItemKeys);
    }

    public subscribeSelectedItemsChanged(): PopChannel<
        Set<string> | undefined
    > {
        return this.selectedItemsEventMultiChan.copy();
    }

    public setMultiSelectionEnabled = (enabled: boolean) => {
        this.multiSelectionEnabled = enabled;
    };

    public selectItem = (key: string) => {
        if (this.multiSelectionEnabled) {
            if (this.selectedItemKeys.has(key)) {
                this.selectedItemKeys.delete(key);
            } else {
                this.selectedItemKeys.add(key);
            }
        } else {
            if (
                this.selectedItemKeys.size === 0 ||
                (this.selectedItemKeys.has(key) &&
                    this.selectedItemKeys.size > 1)
            ) {
                this.selectedItemKeys = new Set([key]);
            } else {
                this.selectedItemKeys = new Set([]);
            }
        }

        return this.selectedItemsChangedChan.put(this.selectedItemKeys);
    };

    public reset() {
        this.selectedItemKeys = new Set();
        return this.selectedItemsChangedChan.put(this.selectedItemKeys);
    }

}
