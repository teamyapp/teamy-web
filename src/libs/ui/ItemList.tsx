import React, { KeyboardEvent, ReactNode, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './ItemList.module.scss';

interface Props<Item, ItemValue> {
    items: Item[];
    renderInlineItem: (item: Item) => ReactNode;
    newItemInputLabel: string;
    isItemValid?: (itemValue: ItemValue) => Promise<boolean>;
    isItemDuplicate: (itemValue: ItemValue) => boolean;
    onAddItem?: (itemValue: ItemValue) => void;
    onRemoveItem?: (item: Item) => void;

    parseNewItem(input: string): ItemValue;
}

export function ItemListUI<Item, ItemValue>(props: Props<Item, ItemValue>) {
    const newItemInputRef = createRef<HTMLInputElement>();

    const onNewItemInputKeydown = async (
        event: KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            const itemValue = props.parseNewItem(
                newItemInputRef.current?.value || '',
            );
            if (await props.isItemValid?.(itemValue)) {
                if (!props.isItemDuplicate?.(itemValue)) {
                    props.onAddItem?.(itemValue);
                }
            }

            newItemInputRef.current!.value = '';
        }
    };

    const onRemoveItemHandler = (item: Item) => {
        return () => {
            props.onRemoveItem?.(item);
        };
    };

    return (
        <div className={styles.ItemList}>
            {props.items.map((item, index) => {
                return (
                    <div key={index} className={styles.Item}>
                        {props.renderInlineItem(item)}
                        <div
                            className={styles.Remove}
                            onClick={onRemoveItemHandler(item)}
                        >
                            <MaterialIconUI>cancel</MaterialIconUI>
                        </div>
                    </div>
                );
            })}
            <input
                ref={newItemInputRef}
                type={'text'}
                className={styles.Input}
                placeholder={props.newItemInputLabel}
                autoComplete={'off'}
                data-1p-ignore={true}
                onKeyDown={onNewItemInputKeydown}
            />
        </div>
    );
}
