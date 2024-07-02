import React, { FC, MouseEvent, useState } from 'react';

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
    zOffset?: number;
}

export const SelectOwnersPopupComponent: FC<Props> = (props) => {
    const [potentialOwners, setPotentialOwners] = useState<User[]>([]);
    const [showFollower, setShowFollower] = useState(false);

    const fetchOwnerList = async () => {
        await props.deps.stateSyncer.pullCurrentTeamMembers();
        const teamMembers = props.deps.graphSource.currentTeam()!.members;
        setPotentialOwners(teamMembers.map((teamMember) => teamMember.user));
    };

    const handleCloseOwnersListClick = (onClose: () => void) => {
        return () => {
            setPotentialOwners([]);
            setShowFollower(false);
            onClose();
        };
    };

    const handleSelectOwner = (onClose: () => void) => (userId: number) => {
        setPotentialOwners([]);
        setShowFollower(false);
        onClose();
        props.onSelectOwner?.call(this, userId);
    };

    const handleRemoveOwner = (onClose: () => void) => () => {
        setPotentialOwners([]);
        setShowFollower(false);
        onClose();
        props.onSelectOwner?.call(this);
    };

    const onAssignOwnerClick = (toggleContainer: () => void) => {
        return (event: MouseEvent) => {
            event.stopPropagation();
            setShowFollower(!showFollower);
            toggleContainer();
        };
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
                    relativeLayout={props.deps.relativeLayout}
                    disabled={showFollower}
                    message={name}
                >
                    <div
                        className={`${styles.Action} ${classNames({
                            [styles.Active]: showFollower,
                        })}`}
                        onClick={onAssignOwnerClick(toggleContainer)}
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

    const onContainerClose = () => {
        setPotentialOwners([]);
        setShowFollower(false);
    };

    return (
        <RelativeLayoutContainerUI
            relativeLayout={props.deps.relativeLayout}
            overSpaceAction='jumpVertically'
            zOffset={
                props.zOffset === undefined
                    ? OWNER_ASSIGNMENT_Z_INDEX
                    : props.zOffset
            }
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
                            showSelected
                        />
                    </div>
                );
            }}
            onCloseContainer={onContainerClose}
        />
    );
};
