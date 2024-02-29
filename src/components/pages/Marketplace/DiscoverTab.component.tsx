import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, createRef } from 'react';

import { FileClient } from '@core/client/file.client';
import { Deps } from '@core/dep/deps';
import { App } from '@core/entity/app';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { AppIconComponent } from './AppIcon.component';
import styles from './DiscoveredTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import githubBannerImg from './assets/github_ads.png';
import { formatCount, formatPrice } from './format';

export const APP_VERSION_ICON_SIZE = 100;

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {}

export class DiscoverTabComponent extends Component<Props, State> {
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

    private onInstallAppButtonClick = (
        appId: number,
        currentTeamId: number,
    ) => {
        return () => {
            this.stateSyncer.installAppToTeam(appId, currentTeamId);
        };
    };

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
        const currentTeamId = this.graphSource.currentTeam()?.id;
        if (!currentTeamId) {
            return null;
        }

        const latestAppVersions =
            this.graphSource.latestAppVersions(currentTeamId);
        return (
            <>
                <div className={styles.BannerSection}>
                    <div className={styles.Banner}>
                        <div className={styles.Controls}>
                            <div
                                className={`${styles.Control} ${styles.Active}`}
                            />
                            <div className={styles.Control} />
                            <div className={styles.Control} />
                            <div className={styles.Control} />
                        </div>
                        <img src={githubBannerImg} />
                    </div>
                </div>
                <div className={styles.ItemList}>
                    {latestAppVersions.map((appVersion) => (
                        <div
                            key={appVersion.app.id}
                            className={styles.InlineItem}
                        >
                            <div className={styles.LeftSection}>
                                <AppIconComponent
                                    appName={appVersion.appName}
                                    appIconUrl={this.fileClient.getRemoteFileUrl(
                                        appVersion.iconPath(
                                            APP_VERSION_ICON_SIZE,
                                        ),
                                    )}
                                />
                            </div>
                            <div className={styles.MiddleSection}>
                                <div className={styles.Name}>
                                    {appVersion.appName}
                                </div>
                                <div className={styles.Installations}>
                                    {formatCount(
                                        appVersion.app.totalInstallations,
                                    )}{' '}
                                    installed
                                </div>
                            </div>
                            <div className={styles.RightSection}>
                                {appVersion.app.isInstalled(currentTeamId) && (
                                    <>
                                        <div
                                            className={`${styles.Button} ${styles.Setting}`}
                                            onClick={this.onAppSettingButtonClickHandler(
                                                appVersion.app.id,
                                            )}
                                        >
                                            Setting
                                        </div>
                                        <div
                                            className={`${styles.Button}  ${styles.Remove}`}
                                            onClick={this.onRemoveAppButtonClick(
                                                appVersion.app,
                                                currentTeamId,
                                            )}
                                        >
                                            Remove
                                        </div>
                                    </>
                                )}
                                {!appVersion.app.isInstalled(currentTeamId) && (
                                    <>
                                        <div className={styles.Price}>
                                            {appVersion.localPrice
                                                ? formatPrice(
                                                      appVersion.localPrice
                                                          .amount,
                                                  )
                                                : 'Free'}
                                        </div>
                                        <div
                                            className={`${styles.Button}`}
                                            onClick={this.onInstallAppButtonClick(
                                                appVersion.app.id,
                                                currentTeamId,
                                            )}
                                        >
                                            Install
                                        </div>
                                    </>
                                )}
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
