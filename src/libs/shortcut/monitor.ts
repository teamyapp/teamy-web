import { PopChannel, chan, multi } from '@lib/csp/csp';

export type Key = 'ControlKey' | 'MetaKey' | 'FKey';

export interface Shortcut<UserActionEvent> {
    keys: Key[];
    userAction: UserActionEvent;
}

export class ShortcutMonitor<UserActionEvent> {
    private readonly userActionChan = chan<UserActionEvent>();
    private readonly userActionMultiCaster = multi<UserActionEvent>(
        this.userActionChan,
    );
    private readonly shortcutLookup: { [keys: string]: UserActionEvent } = {};

    constructor(shortcuts: Shortcut<UserActionEvent>[]) {
        for (const shortcut of shortcuts) {
            console.log('constructor', serializeKeys(shortcut.keys));
            this.shortcutLookup[serializeKeys(shortcut.keys)] =
                shortcut.userAction;
        }

        window.addEventListener('keydown', this.onKeydown);
    }

    public dispose() {
        window.removeEventListener('keydown', this.onKeydown);
        this.userActionChan.close();
    }

    public subscribeUserAction(): PopChannel<UserActionEvent | undefined> {
        return this.userActionMultiCaster.copy();
    }

    private onKeydown = (event: KeyboardEvent) => {
        const keys: Key[] = [];
        if (event.ctrlKey) {
            keys.push('ControlKey');
        }

        if (event.metaKey) {
            keys.push('MetaKey');
        }

        switch (event.key.toUpperCase()) {
            case 'F':
                keys.push('FKey');
                break;
        }

        if (this.triggerShortcuts(keys)) {
            event.preventDefault();
        }
    };

    private triggerShortcuts(keys: Key[]): boolean {
        const userAction = this.shortcutLookup[serializeKeys(keys)];
        if (userAction) {
            this.userActionChan.put(userAction);
            return true;
        }
        return false;
    }
}

function serializeKeys(keys: Key[]): string {
    return keys.sort().join('+');
}
