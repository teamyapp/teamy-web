import React, { KeyboardEvent, ReactNode, createRef, useState } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import styles from './ItemList.module.scss';

interface Props<Item> {
    items: Item[];
    renderInlineItem: (item: Item) => ReactNode;
    newItemInputLabel: string;
    parseNewItem(input: string): Item;
    isItemValid?: (item: Item) => boolean;
    isItemDuplicate: (item: Item) => boolean;
    onAddItem?: (item: Item) => void;
    onRemoveItem?: (item: Item) => void;
}

export function ItemListUI<Item>(props: Props<Item>) {
    const newItemInputRef = createRef<HTMLInputElement>();
    const [items, setItems] = useState<Item[]>(props.items);

    const onNewItemInputKeydown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            const item = props.parseNewItem(
                newItemInputRef.current?.value || '',
            );
            if (props.isItemValid?.(item)) {
                if (!props.isItemDuplicate?.(item)) {
                    setItems([...items, item]);
                    props.onAddItem?.(item);
                }
            }

            newItemInputRef.current!.value = '';
        }
    };

    const onRemoveItemHandler = (item: Item) => {
        return () => {
            setItems(items.filter((currItem) => currItem !== item));
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
