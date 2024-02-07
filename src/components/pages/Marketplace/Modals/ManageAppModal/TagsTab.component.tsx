import React, { useEffect } from 'react';

import { ItemListUI } from '@lib/ui/ItemList';

import { Deps } from '@core/dep/deps';
import { Tag } from '@core/entity/tag';

import styles from './TagsTab.component.module.scss';

interface Props {
    appId: number;
    tags: Tag[];
    deps: Deps;
}

export function TagsTabComponent(props: Props) {
    const [tags, setTags] = React.useState<Tag[]>(props.tags);
    useEffect(() => {
        const stateChangeChan = props.deps.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log('[TagsTabComponent] waiting for state changes');
                const hasChanged = await stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }
                const app = props.deps.graphSource.app(props.appId);
                if (app) {
                    setTags(app.tags);
                }
            }
        })().then();
        return () => {
            stateChangeChan?.close();
        };
    }, []);

    const renderInlineTag = (tag: Tag) => {
        return <div className={styles.Tag}>{tag.value}</div>;
    };

    const parseNewTag = (tag: string) => {
        return tag.trim();
    };

    const isTagValid = (tag: string) => {
        return true;
    };

    const isTagDuplicate = (value: string) => {
        return props.tags.some((t) => t.value === value);
    };

    const onAddTag = (value: string) => {
        props.deps.stateSyncer.addTagToApp(props.appId, value);
    };

    const onRemoveTag = (tag: Tag) => {
        props.deps.stateSyncer.removeTagFromApp(props.appId, tag.id);
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
