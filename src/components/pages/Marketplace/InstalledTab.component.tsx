import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, ReactElement, createRef } from 'react';

import { FileClient } from '@core/client/file.client';
import { Deps } from '@core/dep/deps';
import { App } from '@core/entity/app';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { AppIconComponent } from './AppIcon.component';
import styles from './InstalledTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import { formatCount } from './format';

export const APP_VERSION_ICON_SIZE = 100;

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {}

export class InstalledTabComponent extends Component<Props, State> {
    private readonly appSettingModalRef = createRef<AppSettingModalComponent>();
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly fileClient: FileClient;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.fileClient = props.deps.fileClient;
    }

    private onRemoveAppButtonClick = (app: App, currentTeamId: number) => {
        return () => {
            const appTeamInstallation = app.installations.find(
                (installation) =>
                    installation.installedTeam.id === currentTeamId,
            );

            if (!appTeamInstallation) {
                return;
            }

            this.stateSyncer.uninstallAppFromTeam(appTeamInstallation.id);
        };
    };

    render() {
        const installations = this.graphSource.currentTeam()?.appInstallations;
        if (!installations) {
            return null;
        }

        return (
            <>
                <div className={styles.ItemList}>
                    {installations.map((item) => (
                        <div className={styles.InlineItem} key={item.id}>
                            <div className={styles.LeftSection}>
                                <AppIconComponent
                                    appName={item.activeAppVersion.appName}
                                    appIconUrl={this.fileClient.getRemoteFileUrl(
                                        item.activeAppVersion.iconPath(
                                            APP_VERSION_ICON_SIZE,
                                        ),
                                    )}
                                />
                            </div>
                            <div className={styles.MiddleSection}>
                                <div className={styles.Name}>
                                    {item.activeAppVersion.appName}
                                </div>
                                <div className={styles.Installations}>
                                    {formatCount(
                                        item.activeAppVersion.app
                                            .totalInstallations,
                                    )}{' '}
                                    installed
                                </div>
                            </div>
                            <div className={styles.RightSection}>
                                <div
                                    className={`${styles.Button} ${styles.Setting}`}
                                    onClick={this.onAppSettingButtonClickHandler(
                                        item.activeAppVersion.app.id,
                                    )}
                                >
                                    Setting
                                </div>
                                <div
                                    className={`${styles.Button}  ${styles.Remove}`}
                                    onClick={this.onRemoveAppButtonClick(
                                        item.activeAppVersion.app,
                                        item.installedTeam.id,
                                    )}
                                >
                                    Remove
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <AppSettingModalComponent
                    ref={this.appSettingModalRef}
                    deps={this.props.deps}
                    thirdPartyAppEventHubs={this.props.thirdPartyAppEventHubs}
                />
            </>
        );
    }

    private onAppSettingButtonClickHandler = (appId: number) => {
        return () => {
            this.appSettingModalRef.current?.open(appId);
        };
    };
}
