import React, { FC, MouseEvent } from 'react';

import { RelativeLayoutContainerUI } from '@lib/layout';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';

import styles from './SelectOwnersPopupComponent.module.scss';
import { SelectUserListUI } from './SelectUserList';

interface Props {
    deps: Deps;
    selectedOwnerId?: number;
    onSelectOwner?: (OwnerId?: number) => void;
    assignOwner: (props: {
        onToggle: () => void;
        showFollower: boolean;
    }) => React.ReactNode;
}

export const SelectOwnersPopupComponent: FC<Props> = (props) => {
    const [potentialOwners, setPotentialOwners] = React.useState<User[]>([]);
    const ownersPopupRef = React.useRef<HTMLDivElement>(null);

    const fetchOwnerList = async () => {
        await props.deps.stateSyncer.pullCurrentTeamMembers();
        const teamMembers = props.deps.graphSource.currentTeam()!.members;
        setPotentialOwners(teamMembers.map((teamMember) => teamMember.user));

        setTimeout(() => {
            ownersPopupRef.current?.focus();
        });
    };

    const handleCloseOwnersListClick = (onClose: () => void) => {
        return () => {
            setPotentialOwners([]);
            onClose();
        };
    };

    const handleSelectOwner = (onClose: () => void) => (userId: number) => {
        setPotentialOwners([]);
        onClose();
        props.onSelectOwner?.call(this, userId);
    };

    const handleRemoveOwner = (onClose: () => void) => () => {
        setPotentialOwners([]);
        onClose();
        props.onSelectOwner?.call(this);
    };

    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.deps.relativeLayout}
            overSpaceAction='jumpVertically'
            renderReferenceElement={props.assignOwner}
            renderFollower={({ onClose, showFollower }) => {
                if (showFollower) {
                    fetchOwnerList();
                }

                return (
                    <div
                        ref={ownersPopupRef}
                        className={styles.SelectOwnersPopup}
                        tabIndex={-1}
                        onBlur={handleCloseOwnersListClick(onClose)}
                    >
                        <div className={styles.SelectOwnerListHeader}>
                            <div
                                className={styles.CloseButton}
                                onClick={handleCloseOwnersListClick(onClose)}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <SelectUserListUI
                            emptySelectionUserName={'Unassigned'}
                            selectedUserId={props.selectedOwnerId}
                            users={potentialOwners}
                            onSelectUser={handleSelectOwner(onClose)}
                            onRemoveSelection={handleRemoveOwner(onClose)}
                        />
                    </div>
                );
            }}
        />
    );
};
