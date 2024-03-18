import { PopChannel, chan, multi } from '@lib/csp/csp';

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

    public setMultiSelectionEnabled(enabled: boolean) {
        this.multiSelectionEnabled = enabled;
    };

    public selectItem = (key: string) {
        if (this.multiSelectionEnabled) {
            if (this.selectedItemKeys.has(key)) {
                this.selectedItemKeys.delete(key);
            } else {
                this.selectedItemKeys.add(key);
            }
        } else {
            if (
                this.selectedItemKeys.has(key) && 
                this.selectedItemKeys.size === 1
            ) {
                this.selectedItemKeys = new Set([]);
            } else {
                this.selectedItemKeys = new Set([key]);
            }
        }

        return this.selectedItemsChangedChan.put(this.selectedItemKeys);
    };

    public reset() {
        this.selectedItemKeys = new Set();
        return this.selectedItemsChangedChan.put(this.selectedItemKeys);
    }
}
