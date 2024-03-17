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

export class ItemsSelector {
    private selectedItemKeys: Set<string> = new Set();
    private multiSelectionEnabled: boolean;

    private selectedItemsChangedChan = chan<Set<string>>();
    private selectedItemsEventMultiChan = multi<Set<string>>(this.selectedItemsChangedChan);

    constructor(
        multiSelectionEnabled: boolean,
        selectedItemKeys: Set<string>,
    ) {
        this.multiSelectionEnabled = multiSelectionEnabled;
        this.selectedItemKeys = new Set(selectedItemKeys);
    }

    public subscribeSelectedItemsChanged(): PopChannel<Set<string> | undefined> {
        return this.selectedItemsEventMultiChan.copy();
    }

    public setMultiSelectionEnabled = (enabled: boolean) => {
        this.multiSelectionEnabled = enabled;
    };

    public setSelectedItemKeys = (selectedItemKeys: Set<string>) => {
        this.selectedItemKeys = selectedItemKeys;
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
                this.selectedItemKeys.has(key) &&
                this.selectedItemKeys.size > 1
            ) {
                this.selectedItemKeys = new Set([key]);
            } else if (this.selectedItemKeys.has(key)) {
                this.selectedItemKeys = new Set([]);
            } else {
                this.selectedItemKeys = new Set([key]);
            }
        }

        debugger

        this.selectedItemsChangedChan.put(this.selectedItemKeys);
    };
}
