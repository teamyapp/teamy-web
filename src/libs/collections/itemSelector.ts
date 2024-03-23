import { PopChannel, chan, multi } from '@lib/csp/csp';
import { Disposable } from '@lib/lifeCycle/disposable';

export class ItemsSelector implements Disposable {
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

    public setMultiSelectionEnabled(enabled: boolean) {
        this.multiSelectionEnabled = enabled;
    }

    public reset() {
        this.selectedItemKeys = new Set();
        return this.selectedItemsChangedChan.put(this.selectedItemKeys);
    }

    public async selectItem(key: string):Promise<boolean> {
        let isSelected = false
        if (this.multiSelectionEnabled) {
            if (this.selectedItemKeys.has(key)) {
                this.selectedItemKeys.delete(key);
            } else {
                isSelected = true
                this.selectedItemKeys.add(key);
            }
        } else {
            if (
                this.selectedItemKeys.has(key) &&
                this.selectedItemKeys.size === 1
            ) {
                this.selectedItemKeys = new Set([]);
            } else {
                isSelected = true
                this.selectedItemKeys = new Set([key]);
            }
        }

        await this.selectedItemsChangedChan.put(this.selectedItemKeys);
        return isSelected
    }

    public subscribeSelectedItemsChanged(): PopChannel<
        Set<string> | undefined
    > {
        return this.selectedItemsEventMultiChan.copy();
    }

    public dispose() {
        return this.selectedItemsChangedChan.close();
    }
}
