import React, {FC, useRef, useState} from 'react';

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
        toggleContainer: () => void;
        showFollower: boolean;
    }) => React.ReactNode;
}

export const SelectOwnersPopupComponent: FC<Props> = (props) => {
    const [potentialOwners, setPotentialOwners] = useState<User[]>([]);

    const fetchOwnerList = async () => {
        await props.deps.stateSyncer.pullCurrentTeamMembers();
        const teamMembers = props.deps.graphSource.currentTeam()!.members;
        setPotentialOwners(teamMembers.map((teamMember) => teamMember.user));
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
            renderReferenceElement={({ toggleContainer, showFollower }) => {
                return props.assignOwner({
                    toggleContainer,
                    showFollower,
                });
            }}
            onOpenContainer={fetchOwnerList}
            renderFollower={({ closeContainer }) => {
                return (
                    <div
                        className={styles.SelectOwnersPopup}
                    >
                        <div className={styles.SelectOwnerListHeader}>
                            <div
                                className={styles.CloseButton}
                                onClick={handleCloseOwnersListClick(
                                    closeContainer,
                                )}
                            >
                                <MaterialIconUI>close</MaterialIconUI>
                            </div>
                        </div>
                        <SelectUserListUI
                            emptySelectionUserName={'Unassigned'}
                            selectedUserId={props.selectedOwnerId}
                            users={potentialOwners}
                            onSelectUser={handleSelectOwner(closeContainer)}
                            onRemoveSelection={handleRemoveOwner(
                                closeContainer,
                            )}
                        />
                    </div>
                );
            }}
        />
    );
};
