import React, { useState } from 'react';

import { ItemListUI } from '@lib/ui/ItemList';

import styles from './TagsTab.component.module.scss';

interface Props {
    tags: string[];
    onAddTage?: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
}

export function TagsTabComponent(props: Props) {
    const [tags, setTags] = useState<string[]>(props.tags);
    const renderInlineTag = (tag: string) => {
        return <div className={styles.Tag}>{tag}</div>;
    };

    const parseNewTag = (tag: string) => {
        return tag.trim();
    };

    const isTagValid = (tag: string) => {
        return tag.length > 0;
    };

    const isTagDuplicate = (tag: string) => {
        return tags.includes(tag);
    };

    const onAddTag = (tag: string) => {
        setTags([...tags, tag]);
        props.onAddTage?.(tag);
    };

    const onRemoveTag = (tag: string) => {
        setTags(tags.filter((t) => t !== tag));
        props.onRemoveTag?.(tag);
    };

    return (
        <div className={styles.TagsTab}>
            <div className={`${styles.Row}`}>
                <div className={`${styles.Label} ${styles.NextRow}`}>Tags:</div>
                <ItemListUI
                    items={tags}
                    renderInlineItem={renderInlineTag}
                    newItemInputLabel={'Enter tag'}
                    parseNewItem={parseNewTag}
                    isItemValid={isTagValid}
                    isItemDuplicate={isTagDuplicate}
                    onAddItem={onAddTag}
                    onRemoveItem={onRemoveTag}
                />
            </div>
        </div>
    );
}
