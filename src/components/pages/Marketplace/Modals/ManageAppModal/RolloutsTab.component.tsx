import classNames from 'classnames';
import moment from 'moment/moment';
import React, { ReactNode, createRef, useState } from 'react';

import { Rollout } from '@core/entity/rollout';

import { CreateTeamRolloutModalComponent } from '../CreateTeamRolloutModal.component';
import { CreateUserRolloutModalComponent } from '../CreateUserRolloutModal.component';
import {
    EditRolloutViewComponent,
    EditRolloutViewComponentHandle,
} from '../EditRolloutView.component';
import styles from './RolloutsTab.component.module.scss';
import { Deps } from '@core/dep/deps';
import { CreateActivatorInput, CreateAppRolloutInput, CreateVersionSelectorInput, UpdateActivatorInput, UpdateRolloutInput, UpdateVersionSelectorInput } from '@core/entity/input';

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

const EditUserGroupRolloutViewComponent = EditRolloutViewComponent();
const EditTeamGroupRolloutViewComponent = EditRolloutViewComponent();

interface Props {
    appId: number;
    deps: Deps;
    isValidVersionNumber: (versionNumber: number) => boolean;
    renderInlineVersionNumber: (versionNumber: number) => ReactNode;
}

export function RolloutsTabComponent(props: Props) {
    const editUserGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle>();
    const editTeamGroupRolloutViewRef =
        createRef<EditRolloutViewComponentHandle>();
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
        useState<Rollout>();
    const [selectedTeamGroupRollout, setSelectedTeamGroupRollout] =
        useState<Rollout>();

    const onCreateRolloutClick = (rollout: CreateAppRolloutInput) => {
        props.deps.stateSyncer.createAppRollout(props.appId, rollout);
    }

    const onSaveRolloutClick = (rollout: UpdateRolloutInput) => {
        props.deps.stateSyncer.updateRollout(rollout);
    }

    const saveActivator = async (activatorId: number, input: UpdateActivatorInput) => {
        props.deps.stateSyncer.updateActivator(activatorId, input);
    }

    const saveVersionSelector = async (versionSelectorId: number, input: UpdateVersionSelectorInput) => {
        props.deps.stateSyncer.updateVersionSelector(props.appId, versionSelectorId, input);
    }

    const onDeleteRolloutClick = (rolloutId: number) => {
        setSelectedTeamGroupRollout(undefined);
        setSelectedUserGroupRollout(undefined);
        props.deps.stateSyncer.deleteRollout(rolloutId);
    }

    const createActivator = (input: CreateActivatorInput) => {
        createUserRolloutModalRef.current?.close();
        createTeamRolloutModalRef.current?.close();
        return props.deps.stateSyncer.createActivator(input);
    }

    const createVersionSelector = (input: CreateVersionSelectorInput) => {
        return props.deps.stateSyncer.createVersionSelector(props.appId, input);
    }

    const onRolloutGroupTabClickHandler = (tab: Tab<RolloutGroupTabKey>) => {
        return () => {
            setShowRolloutGroupTabViews({
                users: false,
                teams: false,
                [tab.key]: true,
            });
        };
    };

    const onInlineUserRolloutClickHandler = (rollout: Rollout) => {
        return () => {
            setSelectedUserGroupRollout(rollout);
            editUserGroupRolloutViewRef.current?.show(rollout);
        };
    };

    const onInlineTeamRolloutClickHandler = (rollout: Rollout) => {
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

    const renderInlineRollout = (
        rollout: Rollout,
        onInlineRolloutClickHandler: (rollout: Rollout) => () => void,
        selectedRollout?: Rollout,
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
        const app = props.deps.graphSource.app(props.appId);
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
                        {app?.userRollouts.map((rollout: Rollout) =>
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
                        {app?.teamRollouts.map((rollout: Rollout) =>
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
                            appRolloutType='USER'
                            onSaveRolloutClick={onSaveRolloutClick}
                            onDeleteRolloutClick={onDeleteRolloutClick}
                            saveActivator={saveActivator}
                            saveVersionSelector={saveVersionSelector}
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
                            appRolloutType='TEAM'
                            onSaveRolloutClick={onSaveRolloutClick}
                            onDeleteRolloutClick={onDeleteRolloutClick}
                            saveActivator={saveActivator}
                            saveVersionSelector={saveVersionSelector}
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
            <CreateUserRolloutModalComponent 
                ref={createUserRolloutModalRef} 
                deps={props.deps} 
                appId={props.appId}
                isValidVersionNumber={props.isValidVersionNumber}
                onCreateRolloutClick={onCreateRolloutClick}
                createActivator={createActivator}
                createVersionSelector={createVersionSelector}
                
            />
            <CreateTeamRolloutModalComponent
                ref={createTeamRolloutModalRef}
                deps={props.deps}
                appId={props.appId}
                isValidVersionNumber={props.isValidVersionNumber}
                onCreateRolloutClick={onCreateRolloutClick}
                createActivator={createActivator}
                createVersionSelector={createVersionSelector}
            />
        </>
    );
}
