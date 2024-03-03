import classNames from 'classnames';
import moment from 'moment/moment';
import React, { ReactNode, createRef, useEffect, useState } from 'react';

import { Deps } from '@core/dep/deps';
import { Group } from '@core/entity/group';
import { UpdateGroupInput } from '@core/entity/input';

import { CreateTeamGroupModalComponent } from '../CreateTeamGroupModal.component';
import { CreateUserGroupModalComponent } from '../CreateUserGroupModal.component';
import { EditGroupViewComponent } from '../EditGroupView.component';
import styles from './GroupsTab.component.module.scss';

interface Tab<Key> {
    name: string;
    key: Key;
}

type GroupTabKey = 'users' | 'teams';

const groupTabs: Tab<GroupTabKey>[] = [
    {
        name: 'Teams',
        key: 'teams',
    },
    {
        name: 'Users',
        key: 'users',
    },
];

interface Props {
    deps: Deps;
    appId: number;
    isValidUser?: (userId: number) => Promise<boolean>;
    isValidTeam?: (teamId: number) => Promise<boolean>;
    renderInlineUser: (userId: number) => ReactNode;
    renderInlineTeam: (teamId: number) => ReactNode;
}

export function GroupsTabComponent(props: Props) {
    const editGroupViewRef = createRef<EditGroupViewComponent>();
    const createUserGroupModalRef = createRef<CreateUserGroupModalComponent>();
    const createTeamGroupModalRef = createRef<CreateTeamGroupModalComponent>();
    const [showGroupTabViews, setShowGroupTabViews] = useState<{
        [key in GroupTabKey]: boolean;
    }>({
        users: false,
        teams: true,
    });

    const [selectedUserGroup, setSelectedUserGroup] = useState<Group>();
    const [selectedTeamGroup, setSelectedTeamGroup] = useState<Group>();

    const isValidRollout = async (rolloutId: number): Promise<boolean> => {
        const appState = props.deps.localStore.getState();
        if (!appState.rollouts[rolloutId]) {
            return false;
        }

        const appRolloutRelationType = selectedUserGroup ? 'USER' : 'TEAM';
        return appState.appRolloutRelations.some((relation) => {
            return (
                relation.rolloutId === rolloutId &&
                relation.appId === props.appId &&
                relation.type === appRolloutRelationType
            );
        });
    };

    const onCreateUserGroupClick = () => {
        createUserGroupModalRef.current?.open();
    };

    const onCreateTeamGroupClick = () => {
        createTeamGroupModalRef.current?.open();
    };

    const onInlineUserGroupClickHandler = (group: Group) => {
        return () => {
            setSelectedUserGroup(group);
            setSelectedTeamGroup(undefined);
            editGroupViewRef.current?.show(group);
        };
    };

    const onInlineTeamGroupClickHandler = (group: Group) => {
        return () => {
            setSelectedTeamGroup(group);
            setSelectedUserGroup(undefined);
            editGroupViewRef.current?.show(group);
        };
    };

    const onGroupTabClickHandler = (tab: Tab<GroupTabKey>) => {
        return () => {
            setShowGroupTabViews({
                users: false,
                teams: false,
                [tab.key]: true,
            });
            switch (tab.key) {
                case 'users': {
                    if (!selectedUserGroup) {
                        return;
                    }

                    editGroupViewRef.current?.show(selectedUserGroup);
                    break;
                }
                case 'teams': {
                    if (!selectedTeamGroup) {
                        return;
                    }

                    editGroupViewRef.current?.show(selectedTeamGroup);
                    break;
                }
            }
        };
    };

    const onDeleteGroupClick = (groupId: number) => {
        props.deps.stateSyncer.deleteGroup(groupId);

        if (selectedUserGroup?.id === groupId) {
            setSelectedUserGroup(undefined);
        } else if (selectedTeamGroup?.id === groupId) {
            setSelectedTeamGroup(undefined);
        }
    };

    const onSaveGroupClick = (groupId: number, group: UpdateGroupInput) => {
        props.deps.stateSyncer.updateGroup(props.appId, groupId, group);
    };

    const renderInlineRolloutForEdit = (rolloutId: number): ReactNode => {
        const rollout = props.deps.graphSource.rollout(rolloutId);
        return (
            rollout && (
                <div className={styles.InlineRollout}>
                    <div className={styles.Id}>{rollout.id}</div>
                    <div className={styles.Name}>{rollout.name}</div>
                </div>
            )
        );
    };

    const renderInlineGroup = (
        group: Group,
        onInlineGroupClickHandler: (group: Group) => () => void,
        selectedGroup?: Group,
    ) => {
        return (
            <div
                key={group.id}
                className={`${styles.Group} ${classNames({
                    [styles.Active]: selectedGroup?.id == group.id,
                })}`}
                onClick={onInlineGroupClickHandler(group)}
            >
                <div className={styles.TopRow}>
                    <div className={`${styles.Attribute} ${styles.Id}`}>
                        {group.id}
                    </div>
                </div>
                <div className={styles.Name}>{group.name}</div>
                <div className={styles.CreatedAt}>
                    {moment(group.createdAt).fromNow()}
                </div>
            </div>
        );
    };

    const renderGroupsSection = (): ReactNode => {
        const app = props.deps.graphSource.app(props.appId);
        const userGroups = app?.userGroups || [];
        const teamGroups = app?.teamGroups || [];

        if (showGroupTabViews['users']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateGroup}`}
                        onClick={onCreateUserGroupClick}
                    >
                        Create Group
                    </div>
                    <div className={styles.GroupList}>
                        {userGroups.map((userGroup) =>
                            renderInlineGroup(
                                userGroup,
                                onInlineUserGroupClickHandler,
                                selectedUserGroup,
                            ),
                        )}
                    </div>
                </>
            );
        } else if (showGroupTabViews['teams']) {
            return (
                <>
                    <div
                        className={`${styles.Action} ${styles.CreateGroup}`}
                        onClick={onCreateTeamGroupClick}
                    >
                        Create Group
                    </div>
                    <div className={styles.GroupList}>
                        {teamGroups.map((teamGroup) =>
                            renderInlineGroup(
                                teamGroup,
                                onInlineTeamGroupClickHandler,
                                selectedTeamGroup,
                            ),
                        )}
                    </div>
                </>
            );
        }
    };

    const renderGroupDetail = (): ReactNode => {
        if (showGroupTabViews['users']) {
            return (
                selectedUserGroup && (
                    <div className={`${styles.Box} ${styles.Group}`}>
                        <EditGroupViewComponent
                            ref={editGroupViewRef}
                            group={selectedUserGroup}
                            membersLabel={'Users'}
                            memberLabel={'User'}
                            renderInlineGroupMember={props.renderInlineUser}
                            renderInlineRollout={renderInlineRolloutForEdit}
                            isValidMember={props.isValidUser}
                            isValidRollout={isValidRollout}
                            onDeleteGroupClick={onDeleteGroupClick}
                            onSaveGroupClick={onSaveGroupClick}
                        />
                    </div>
                )
            );
        } else if (showGroupTabViews['teams']) {
            return (
                selectedTeamGroup && (
                    <div className={`${styles.Box} ${styles.Group}`}>
                        <EditGroupViewComponent
                            ref={editGroupViewRef}
                            group={selectedTeamGroup}
                            membersLabel={'Teams'}
                            memberLabel={'Team'}
                            renderInlineGroupMember={props.renderInlineTeam}
                            renderInlineRollout={renderInlineRolloutForEdit}
                            isValidMember={props.isValidTeam}
                            isValidRollout={isValidRollout}
                            onDeleteGroupClick={onDeleteGroupClick}
                            onSaveGroupClick={onSaveGroupClick}
                        />
                    </div>
                )
            );
        }
    };

    return (
        <>
            <div className={styles.GroupsTab}>
                <div className={styles.GroupListSection}>
                    <div className={styles.Tabs}>
                        {groupTabs.map((tab) => (
                            <div
                                key={tab.key}
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]: showGroupTabViews[tab.key],
                                })}`}
                                onClick={onGroupTabClickHandler(tab)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    {renderGroupsSection()}
                </div>
                <div className={styles.GroupDetailSection}>
                    {renderGroupDetail()}
                </div>
            </div>
            <CreateUserGroupModalComponent
                deps={props.deps}
                ref={createUserGroupModalRef}
                appId={props.appId}
            />
            <CreateTeamGroupModalComponent
                deps={props.deps}
                ref={createTeamGroupModalRef}
                appId={props.appId}
            />
        </>
    );
}
