import { describe, expect, it } from 'vitest';

import { ItemsSelector } from './itemSelector';

describe('ItemSelector', () => {
    it.each([
        {
            name: '[single selection]: can select one item',
            initialSelectedItems: new Set([]),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: can deselect one item only if there is one selected item',
            initialSelectedItems: new Set(['1']),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set([]),
        },
        {
            name: '[single selection]: can select one item if there are multiple selected items and it is selected',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: can select one item if there are multiple selected items and it is not selected',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('4'),
            expected: new Set(['4']),
        },
        {
            name: '[single selection]: can reset selected items',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[single selection]: can change multi selection mode',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            action: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(true);
                itemSelector.selectItem('4');
            },
            expected: new Set(['1', '2', '3', '4']),
        },

        {
            name: '[multi selection]: can select one item',
            initialSelectedItems: new Set([]),
            multiSelectionEnabled: true,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[multi selection]: can deselect one item',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('2'),
            expected: new Set(['1', '3']),
        },
        {
            name: '[multi selection]: can reset selected items',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            action: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[multi selection]: can change multi selection mode',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            action: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(false);
                itemSelector.selectItem('4');
            },
            expected: new Set(['4']),
        },
    ])('$name', async ({ initialSelectedItems, multiSelectionEnabled, action, expected }) => {
        const itemSelector = new ItemsSelector(multiSelectionEnabled, initialSelectedItems);
        const chan = itemSelector.subscribeSelectedItemsChanged();
        action(itemSelector);

        const updatedSelectedItems = await chan.pop();

        expect(updatedSelectedItems).toEqual(expected);
    });
});
