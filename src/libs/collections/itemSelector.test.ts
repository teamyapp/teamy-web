import { describe, expect, it } from 'vitest';

import { ItemsSelector } from './itemSelector';

describe('ItemSelector', () => {
    it.each([
        {
            name: '[single selection]: can select one item',
            itemSelector: new ItemsSelector(false, new Set()),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: can deselect one item only if there is one selected item',
            itemSelector: new ItemsSelector(false, new Set(['1'])),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set([]),
        },
        {
            name: '[single selection]: can select one item if there are multiple selected items and it is selected',
            itemSelector: new ItemsSelector(false, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: can select one item if there are multiple selected items and it is not selected',
            itemSelector: new ItemsSelector(false, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('4'),
            expected: new Set(['4']),
        },
        {
            name: '[single selection]: can reset selected items',
            itemSelector: new ItemsSelector(false, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[single selection]: can change multi selection mode',
            itemSelector: new ItemsSelector(false, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(true);
                itemSelector.selectItem('4');
            },
            expected: new Set(['1', '2', '3', '4']),
        },

        {
            name: '[multi selection]: can select one item',
            itemSelector: new ItemsSelector(true, new Set()),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[multi selection]: can deselect one item',
            itemSelector: new ItemsSelector(true, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) =>
                itemSelector.selectItem('2'),
            expected: new Set(['1', '3']),
        },
        {
            name: '[multi selection]: can reset selected items',
            itemSelector: new ItemsSelector(true, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[multi selection]: can change multi selection mode',
            itemSelector: new ItemsSelector(true, new Set(['1', '2', '3'])),
            action: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(false);
                itemSelector.selectItem('4');
            },
            expected: new Set(['4']),
        },
    ])('$name', async ({ itemSelector, action, expected }) => {
        const chan = itemSelector.subscribeSelectedItemsChanged();
        action(itemSelector);

        const updatedSelectedItems = await chan.pop();

        expect(updatedSelectedItems).toEqual(expected);
    });
});
