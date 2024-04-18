import React, { FC, useState } from 'react';

import { RelativeLayoutContainerUI } from '@lib/layout';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { User } from '@core/entity/user';

import styles from './SelectOwnersPopupComponent.module.scss';
import { SelectUserListUI } from './SelectUserList';
import { getUserShortName } from './format';
import { TooltipUI } from '@lib/ui/Tooltip';
import classNames from 'classnames';
import { UserProfileUI } from './UserProfile';

const OWNER_ASSIGNMENT_Z_INDEX = 101;

interface Props {
    deps: Deps;
    selectedOwner?: User;
    onSelectOwner?: (OwnerId?: number) => void;
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

    const renderAssignOwner = ({
        toggleContainer,
        showFollower,
    }: {
        toggleContainer: () => void;
        showFollower: boolean;
    }) => {
        const name = props.selectedOwner
            ? getUserShortName(
                  props.selectedOwner.firstName,
                  props.selectedOwner.lastName,
              )
            : 'Unassigned';

        return (
            <div className={styles.AssignOwner}>
                <TooltipUI
                    message={name}
                    relativeLayout={props.deps.relativeLayout}
                >
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]: showFollower,
                        })}`}
                        onClick={toggleContainer}
                    >
                        <div className={styles.AssignOwnerIcon}>
                            {props.selectedOwner ? (
                                <UserProfileUI user={props.selectedOwner} />
                            ) : (
                                <MaterialIconUI>face</MaterialIconUI>
                            )}
                        </div>
                    </div>
                </TooltipUI>
            </div>
        );
    };

    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.deps.relativeLayout}
            overSpaceAction='jumpVertically'
            zOffset={OWNER_ASSIGNMENT_Z_INDEX}
            referenceOffset={4}
            renderReferenceElement={renderAssignOwner}
            onOpenContainer={fetchOwnerList}
            renderFollower={({ closeContainer }) => {
                return (
                    <div className={styles.SelectOwnersPopup}>
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
                            selectedUserId={props.selectedOwner?.id}
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
