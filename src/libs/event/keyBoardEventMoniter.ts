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

export class MonitorKeyPressed {
    private cleanup: (() => void) | undefined;
    private listenerEnabled: boolean;

    constructor(
        private keyBoardEventMonitor: KeyBoardEventMonitor,
        private componentName: string,
        private keyboardKey: KeyboardKey,
        private onKeyPressed: (keyPressed: boolean) => void,
        listenerEnabled: boolean = true,
    ) {
        this.listenerEnabled = listenerEnabled;
    }

    setListenerEnabled(enabled: boolean) {
        this.listenerEnabled = enabled;
    }

    subscribe() {
        const keyBoardEventChan = this.keyBoardEventMonitor.subscribe();
        (async () => {
            debugger
            while (true) {
                console.log(
                    `[${this.componentName}] waiting for keyboard event`,
                );
                const keyboardEvent = await keyBoardEventChan!.pop();
                if (keyboardEvent === undefined) {
                    return;
                }

                debugger;
                if (!this.listenerEnabled) {
                    continue;
                }

                const { key, eventType } = keyboardEvent;
                if (key === this.keyboardKey) {
                    let keyPressed = false;

                    switch (eventType) {
                        case 'keydown':
                            keyPressed = true;
                            break;
                        case 'keyup':
                            keyPressed = false;
                            break;
                    }

                    this.onKeyPressed(keyPressed);
                }
            }
        })();

        this.cleanup = () => {
            keyBoardEventChan?.close();
        };
    }

    unsubscribe() {
        this.cleanup?.();
    }
}

export class ItemsSelector {
    private selectedItemKeys: Set<string> = new Set();
    private multiSelectionEnabled: boolean;

    constructor(
        private onSelectedItemKeysChanged: (
            selectedItemKeys: Set<string>,
        ) => void,
        multiSelectionEnabled: boolean,
        selectedItemKeys: Set<string>,
    ) {
        this.multiSelectionEnabled = multiSelectionEnabled;
        this.selectedItemKeys = new Set(selectedItemKeys);
    }

    public setMultiSelectionEnabled = (enabled: boolean) => {
        this.multiSelectionEnabled = enabled;
    };

    public setSelectedItemKeys = (selectedItemKeys: Set<string>) => {
        this.selectedItemKeys = selectedItemKeys;
    };

    public selectItem = (id: string) => {
        if (this.multiSelectionEnabled) {
            if (this.selectedItemKeys.has(id)) {
                this.selectedItemKeys.delete(id);
            } else {
                this.selectedItemKeys.add(id);
            }
        } else {
            if (
                this.selectedItemKeys.has(id) &&
                this.selectedItemKeys.size > 1
            ) {
                this.selectedItemKeys = new Set([id]);
            } else if (this.selectedItemKeys.has(id)) {
                this.selectedItemKeys = new Set([]);
            } else {
                this.selectedItemKeys = new Set([id]);
            }
        }

        this.onSelectedItemKeysChanged(this.selectedItemKeys);
    };
}
