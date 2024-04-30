import { RelativeLayout, RelativeLayoutContainerUI } from '@lib/layout';
import { FC } from 'react';
import styles from './SelectUserPopup.component.module.scss';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SelectUserListUI } from './SelectUserList';
import { User } from '@core/entity/user';

interface Props {
    relativeLayout: RelativeLayout;
    users: User[];
    onUserSelect: (userId: number) => void;
    zOffset?: number;
    referenceElement: ({ toggleContainer, showFollower }: { toggleContainer: () => void; showFollower: boolean }) => JSX.Element;
}

export const SelectUserPopupComponent: FC<Props> = (props) => {
    const handleUserSelectClick =
        (closeContainer: () => void) => (userId: number) => {
            closeContainer();

            props.onUserSelect(userId);
        };
    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.relativeLayout}
            zOffset={props.zOffset}
            renderFollower={({ closeContainer }) => {
                return (
                    <div className={styles.Users}>
                        <div className={styles.TopBar}>
                            <div
                                className={styles.CloseButton}
                                onClick={closeContainer}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <div className={styles.UserList}>
                            <SelectUserListUI
                                users={props.users}
                                onSelectUser={handleUserSelectClick(
                                    closeContainer,
                                )}
                            />
                        </div>
                    </div>
                );
            }}
            preserveReferenceParentHeight
            renderReferenceElement={props.referenceElement}
        />
    );
};
