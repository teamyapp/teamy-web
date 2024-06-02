import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';
import { FC } from 'react';
import styles from './SelectItemPopupComponent.component.module.scss';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

interface Props {
    relativeLayout: RelativeLayout;
    itemList: (closeContainer: () => void) => JSX.Element;
    zOffset?: number;
    referenceElement: ({ toggleContainer, showFollower }: { toggleContainer: () => void; showFollower: boolean }) => JSX.Element;
}

export const SelectItemPopupComponent: FC<Props> = (props) => {
    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.relativeLayout}
            zOffset={props.zOffset}
            renderFollower={({ closeContainer }) => {
                return (
                    <div className={styles.Items}>
                        <div className={styles.TopBar}>
                            <div
                                className={styles.CloseButton}
                                onClick={closeContainer}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <div className={styles.ItemList}>
                            {props.itemList(closeContainer)}
                        </div>
                    </div>
                );
            }}
            preserveReferenceParentHeight
            renderReferenceElement={props.referenceElement}
        />
    );
};
