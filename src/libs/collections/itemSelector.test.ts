import { describe, expect, it } from 'vitest';

import { ItemsSelector } from './itemSelector';

describe('ItemSelector', () => {
    it.each([
        {
            name: '[single selection]: select one item',
            initialSelectedItems: new Set([]),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: deselect one item',
            initialSelectedItems: new Set(['1']),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('1'),
            expected: new Set([]),
        },
        {
            name: '[single selection]: keep 1 selected item and deselect the rest when multiSelection is disabled',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('1'),
            expected: new Set(['1']),
        },
        {
            name: '[single selection]: select new item and deselect the rest when multiSelection is disabled',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('4'),
            expected: new Set(['4']),
        },
        {
            name: '[single selection]: reset selected items',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[single selection]: turn on multi selection mode',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: false,
            act: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(true);
                itemSelector.selectItem('4');
            },
            expected: new Set(['1', '2', '3', '4']),
        },

        {
            name: '[multi selection]: select one extra item when multiSelection mode is on by default',
            initialSelectedItems: new Set(['1']),
            multiSelectionEnabled: true,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('2'),
            expected: new Set(['1', '2']),
        },
        {
            name: '[multi selection]: deselect one item when multiSelection mode is on',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            act: (itemSelector: ItemsSelector) => itemSelector.selectItem('2'),
            expected: new Set(['1', '3']),
        },
        {
            name: '[multi selection]: reset selected items',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            act: (itemSelector: ItemsSelector) => itemSelector.reset(),
            expected: new Set([]),
        },
        {
            name: '[multi selection]: change multi selection mode',
            initialSelectedItems: new Set(['1', '2', '3']),
            multiSelectionEnabled: true,
            act: (itemSelector: ItemsSelector) => {
                itemSelector.setMultiSelectionEnabled(false);
                itemSelector.selectItem('4');
            },
            expected: new Set(['4']),
        },
    ])(
        '$name',
        async ({
            initialSelectedItems,
            multiSelectionEnabled,
            act,
            expected,
        }) => {
            const itemSelector = new ItemsSelector(
                multiSelectionEnabled,
                initialSelectedItems,
            );
            const chan = itemSelector.subscribeSelectedItemsChanged();
            act(itemSelector);

            const updatedSelectedItems = await chan.pop();
            expect(updatedSelectedItems).toEqual(expected);
        },
    );
});
