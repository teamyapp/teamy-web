import React, { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { FileClient } from '@core/client/file.client';
import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';

import { AppIconComponent } from './AppIcon.component';
import styles from './ManagedTab.component.module.scss';
import { CreateAppModalComponent } from './Modals/CreateAppModal.component';
import { ManageAppModalComponent } from './Modals/ManageAppModal/ManageAppModal.component';
import { formatCount } from './format';

export const APP_VERSION_ICON_SIZE = 100;

interface Props {
    deps: Deps;
}

export class ManagedTabComponent extends Component<Props> {
    private readonly createAppModalRef = createRef<CreateAppModalComponent>();
    private readonly manageAppModalRef = createRef<ManageAppModalComponent>();
    private readonly graphSource: GraphSource;
    private readonly fileClient: FileClient;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.fileClient = props.deps.fileClient;
        this.state = {};
    }

    render() {
        const managedApps = this.graphSource.currentTeam()?.managedApps;
        if (!managedApps) {
            return null;
        }

        return (
            <>
                <div className={styles.ItemList}>
                    {managedApps.map((app) => {
                        const currentTeamAppVersion = app.latestVersionForTeam(
                            this.graphSource.currentTeam()?.id,
                        );
                        if (!currentTeamAppVersion) {
                            return null;
                        }

                        return (
                            <div className={styles.InlineItem} key={app.id}>
                                <div className={styles.LeftSection}>
                                    <AppIconComponent
                                        appName={currentTeamAppVersion.appName}
                                        appIconUrl={this.fileClient.getRemoteFileUrl(
                                            currentTeamAppVersion.iconPath(
                                                APP_VERSION_ICON_SIZE,
                                            ),
                                        )}
                                    />
                                </div>
                                <div className={styles.MiddleSection}>
                                    <div className={styles.Name}>
                                        {currentTeamAppVersion.appName}
                                    </div>
                                    <div className={styles.Installations}>
                                        {formatCount(
                                            currentTeamAppVersion.app
                                                .totalInstallations,
                                        )}{' '}
                                        installed
                                    </div>
                                </div>
                                <div className={styles.RightSection}>
                                    <div
                                        className={`${styles.Button} ${styles.Manage}`}
                                        onClick={this.onManageButtonClickHandler(
                                            app.id,
                                        )}
                                    >
                                        Manage
                                    </div>
                                    <div
                                        className={`${styles.Button}  ${styles.Delete}`}
                                        onClick={this.onDeleteButtonClickHandler(
                                            app.id,
                                        )}
                                    >
                                        Delete
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div
                        className={styles.CreateAppButton}
                        onClick={this.onCreateAppClick}
                    >
                        <MaterialIconUI>add</MaterialIconUI>
                    </div>
                </div>
                <CreateAppModalComponent
                    ref={this.createAppModalRef}
                    deps={this.props.deps}
                />
                <ManageAppModalComponent
                    ref={this.manageAppModalRef}
                    deps={this.props.deps}
                />
            </>
        );
    }

    private onCreateAppClick = () => {
        this.createAppModalRef.current?.open();
    };

    private onManageButtonClickHandler(itemId: number) {
        return () => {
            this.manageAppModalRef.current?.open(itemId);
        };
    }

    private onDeleteButtonClickHandler(itemId: number) {
        return () => {
            this.props.deps.stateSyncer.deleteApp(itemId);
        };
    }
}
