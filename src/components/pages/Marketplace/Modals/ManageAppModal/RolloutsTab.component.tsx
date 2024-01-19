import classNames from 'classnames';
import moment from 'moment/moment';
import React, { ReactNode, createRef, useState } from 'react';

import { Rollout } from '@core/entity/rollout';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import { CreateTeamRolloutModalComponent } from '../CreateTeamRolloutModal.component';
import { CreateUserRolloutModalComponent } from '../CreateUserRolloutModal.component';
import {
    EditRolloutViewComponent,
    EditRolloutViewComponentHandle,
} from '../EditRolloutView.component';
import styles from './RolloutsTab.component.module.scss';
import { teamGroupRollouts, userGroupRollouts } from './data';

interface Tab<Key> {
    name: string;
    key: Key;
}

type RolloutGroupTabKey = 'users' | 'teams';

const rolloutGroupTabs: Tab<RolloutGroupTabKey>[] = [
    {
        name: 'Users',
        key: 'users',
    },
    {
        name: 'Teams',
        key: 'teams',
    },
];

const EditUserGroupRolloutViewComponent = EditRolloutViewComponent<User>();
const EditTeamGroupRolloutViewComponent = EditRolloutViewComponent<Team>();

interface Props {
    isValidVersionNumber: (versionNumber: number) => boolean;
    renderInlineVersionNumber: (versionNumber: number) => ReactNode;
}

export function RolloutsTabComponent(props: Props) {
    const editUserGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle<User>>();
    const editTeamGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle<Team>>();
    const createUserRolloutModalRef =
        createRef<CreateUserRolloutModalComponent>();
    const createTeamRolloutModalRef =
        createRef<CreateTeamRolloutModalComponent>();

    const [showRolloutGroupTabViews, setShowRolloutGroupTabViews] = useState<{
        [key in RolloutGroupTabKey]: boolean;
    }>({
        users: true,
        teams: false,
    });
    const [selectedUserGroupRollout, setSelectedUserGroupRollout] =
        useState<Rollout<User>>();
    const [selectedTeamGroupRollout, setSelectedTeamGroupRollout] =
        useState<Rollout<Team>>();

    const onRolloutGroupTabClickHandler = (tab: Tab<RolloutGroupTabKey>) => {
        return () => {
            setShowRolloutGroupTabViews({
                users: false,
                teams: false,
                [tab.key]: true,
            });
        };
    };

    const onInlineUserRolloutClickHandler = (rollout: Rollout<User>) => {
        return () => {
            setSelectedUserGroupRollout(rollout);
            editUserGroupRolloutViewRef.current?.show(rollout);
        };
    };

    const onInlineTeamRolloutClickHandler = (rollout: Rollout<Team>) => {
        return () => {
            setSelectedTeamGroupRollout(rollout);
            editTeamGroupRolloutViewRef.current?.show(rollout);
        };
    };

    const onCreateUserRolloutClick = () => {
        createUserRolloutModalRef.current?.open();
    };

    const onCreateTeamRolloutClick = () => {
        createTeamRolloutModalRef.current?.open();
    };

    const renderInlineRollout = <Group,>(
        rollout: Rollout<Group>,
        onInlineRolloutClickHandler: (rollout: Rollout<Group>) => () => void,
        selectedRollout?: Rollout<Group>,
    ) => {
        return (
            <div
                key={rollout.id}
                className={`${styles.Rollout} ${classNames({
                    [styles.Active]: selectedRollout?.id == rollout.id,
                })}`}
                onClick={onInlineRolloutClickHandler(rollout)}
            >
                <div className={styles.TopRow}>
                    <div className={`${styles.Attribute} ${styles.Id}`}>
                        {rollout.id}
                    </div>
                </div>
                <div className={styles.Name}>{rollout.name}</div>
                <div className={styles.CreatedAt}>
                    {moment(rollout.createdAt).fromNow()}
                </div>
            </div>
        );
    };

    const renderRollouts = () => {
        if (showRolloutGroupTabViews['users']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateRollout}`}
                        onClick={onCreateUserRolloutClick}
                    >
                        Create Rollout
                    </div>
                    <div className={styles.RolloutList}>
                        {userGroupRollouts.map((rollout: Rollout<User>) =>
                            renderInlineRollout(
                                rollout,
                                onInlineUserRolloutClickHandler,
                                selectedUserGroupRollout,
                            ),
                        )}
                    </div>
                </>
            );
        } else if (showRolloutGroupTabViews['teams']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateRollout}`}
                        onClick={onCreateTeamRolloutClick}
                    >
                        Create Rollout
                    </div>
                    <div className={styles.RolloutList}>
                        {teamGroupRollouts.map((rollout: Rollout<Team>) =>
                            renderInlineRollout(
                                rollout,
                                onInlineTeamRolloutClickHandler,
                                selectedTeamGroupRollout,
                            ),
                        )}
                    </div>
                </>
            );
        }
    };

    const renderRolloutDetail = (): ReactNode => {
        if (showRolloutGroupTabViews['users']) {
            return (
                selectedUserGroupRollout && (
                    <div className={`${styles.Box} ${styles.Rollout}`}>
                        <EditUserGroupRolloutViewComponent
                            ref={editUserGroupRolloutViewRef}
                            rollout={selectedUserGroupRollout}
                            isValidVersionNumber={props.isValidVersionNumber}
                            renderInlineVersionNumber={
                                props.renderInlineVersionNumber
                            }
                        />
                    </div>
                )
            );
        } else if (showRolloutGroupTabViews['teams']) {
            return (
                selectedTeamGroupRollout && (
                    <div className={`${styles.Box} ${styles.Rollout}`}>
                        <EditTeamGroupRolloutViewComponent
                            ref={editTeamGroupRolloutViewRef}
                            rollout={selectedTeamGroupRollout}
                            isValidVersionNumber={props.isValidVersionNumber}
                            renderInlineVersionNumber={
                                props.renderInlineVersionNumber
                            }
                        />
                    </div>
                )
            );
        }
    };
    return (
        <>
            <div className={styles.RolloutsTab}>
                <div className={styles.RolloutListSection}>
                    <div className={styles.Tabs}>
                        {rolloutGroupTabs.map((tab) => (
                            <div
                                key={tab.key}
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]:
                                        showRolloutGroupTabViews[tab.key],
                                })}`}
                                onClick={onRolloutGroupTabClickHandler(tab)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    {renderRollouts()}
                </div>
                <div className={styles.RolloutDetailSection}>
                    {renderRolloutDetail()}
                </div>
            </div>
            <CreateUserRolloutModalComponent ref={createUserRolloutModalRef} />
            <CreateTeamRolloutModalComponent ref={createTeamRolloutModalRef} />
        </>
    );
}
