import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';
import { FC } from 'react';
import styles from './SelectEntityPopupComponent.component.module.scss';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

interface Props {
    relativeLayout: RelativeLayout;
    objectList: (closeContainer: () => void) => JSX.Element;
    zOffset?: number;
    referenceElement: ({ toggleContainer, showFollower }: { toggleContainer: () => void; showFollower: boolean }) => JSX.Element;
}

export const SelectEntityPopupComponent: FC<Props> = (props) => {
    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.relativeLayout}
            zOffset={props.zOffset}
            renderFollower={({ closeContainer }) => {
                return (
                    <div className={styles.Entities}>
                        <div className={styles.TopBar}>
                            <div
                                className={styles.CloseButton}
                                onClick={closeContainer}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <div className={styles.EntityList}>
                            {props.objectList(closeContainer)}
                        </div>
                    </div>
                );
            }}
            preserveReferenceParentHeight
            renderReferenceElement={props.referenceElement}
        />
    );
};
