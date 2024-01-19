import classNames from 'classnames';
import moment from 'moment/moment';
import React, { ReactNode, createRef, useState } from 'react';

import { Deps } from '@core/dep/deps';
import { Group } from '@core/entity/group';
import { Team } from '@core/entity/team';
import { User } from '@core/entity/user';

import { CreateTeamGroupModalComponent } from '../CreateTeamGroupModal.component';
import { CreateUserGroupModalComponent } from '../CreateUserGroupModal.component';
import { EditGroupViewComponent } from '../EditGroupView.component';
import styles from './GroupsTab.component.module.scss';
import {
    teamGroupRollouts,
    teamGroups,
    userGroupRollouts,
    userGroups,
} from './data';

interface Tab<Key> {
    name: string;
    key: Key;
}

type GroupTabKey = 'users' | 'teams';

const groupTabs: Tab<GroupTabKey>[] = [
    {
        name: 'Users',
        key: 'users',
    },
    {
        name: 'Teams',
        key: 'teams',
    },
];

interface Props {
    deps: Deps;
    appId: number;
    isValidUser?: (userId: number) => boolean;
    isValidTeam?: (teamId: number) => boolean;
    renderInlineUser: (userId: number) => ReactNode;
    renderInlineTeam: (teamId: number) => ReactNode;
}

export function GroupsTabComponent(props: Props) {
    const editGroupViewRef = createRef<EditGroupViewComponent<User | Team>>();
    const createUserGroupModalRef = createRef<CreateUserGroupModalComponent>();
    const createTeamGroupModalRef = createRef<CreateTeamGroupModalComponent>();
    const [showGroupTabViews, setShowGroupTabViews] = useState<{
        [key in GroupTabKey]: boolean;
    }>({
        users: true,
        teams: false,
    });

    const [selectedUserGroup, setSelectedUserGroup] = useState<Group<User>>();
    const [selectedTeamGroup, setSelectedTeamGroup] = useState<Group<Team>>();

    const isValidRollout = (rolloutId: number): boolean => {
        // TODO: pull rollout and read from store
        return (
            userGroupRollouts.some((rollout) => rollout.id == rolloutId) ||
            teamGroupRollouts.some((rollout) => rollout.id == rolloutId)
        );
    };

    const onCreateUserGroupClick = () => {
        createUserGroupModalRef.current?.open();
    };

    const onCreateTeamGroupClick = () => {
        createTeamGroupModalRef.current?.open();
    };

    const onInlineUserGroupClickHandler = (group: Group<User>) => {
        return () => {
            setSelectedUserGroup(group);
            editGroupViewRef.current?.show(group);
        };
    };

    const onInlineTeamGroupClickHandler = (group: Group<Team>) => {
        return () => {
            setSelectedTeamGroup(group);
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
                    editGroupViewRef.current?.show(selectedUserGroup!);
                    break;
                }
                case 'teams': {
                    editGroupViewRef.current?.show(selectedTeamGroup!);
                    break;
                }
            }
        };
    };

    const renderInlineRolloutForEdit = (rolloutId: number): ReactNode => {
        // TODO: pull team
        const rollout =
            userGroupRollouts.find((rollout) => rollout.id == rolloutId) ||
            teamGroupRollouts.find((rollout) => rollout.id == rolloutId);
        return (
            rollout && (
                <div className={styles.InlineRollout}>
                    <div className={styles.Id}>{rollout.id}</div>
                    <div className={styles.Name}>{rollout.name}</div>
                </div>
            )
        );
    };

    const renderInlineGroup = <GroupMember,>(
        group: Group<GroupMember>,
        onInlineGroupClickHandler: (group: Group<GroupMember>) => () => void,
        selectedGroup?: Group<GroupMember>,
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
