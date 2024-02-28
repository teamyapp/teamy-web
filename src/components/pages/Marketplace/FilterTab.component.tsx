import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { RouteUpdate, Router } from '@lib/router/router';

import { FileClient } from '@core/client/file.client';
import { Deps } from '@core/dep/deps';
import { getTags, marketplaceFilterRoutePattern } from '@core/routing/routes';
import { AppNode } from '@core/storage/graph/app.node';
import { APP_VERSION_ICON_SIZE } from '@core/storage/graph/appVersion.node';
import { GraphSource } from '@core/storage/graph/graphSource';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { AppIconComponent } from './AppIcon.component';
import styles from './FilterTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import { formatCount, formatPrice } from './format';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {
    tags?: string[];
}

export class FilterTabComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly fileClient: FileClient;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;
    private readonly appSettingModalRef = createRef<AppSettingModalComponent>();

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.fileClient = props.deps.fileClient;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {};
    }

    componentDidMount() {
        this.routeChangeChan = this.router.subscribeRouteChange();
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (
                    routeUpdate.routePattern.startsWith(
                        marketplaceFilterRoutePattern,
                    )
                ) {
                    this.setState({
                        tags: getTags(routeUpdate.params),
                    });
                }
            }
        })().then();
    }

    private handleAppInstallBtnClicked = (
        appId: number,
        currentTeamId: number,
    ) => {
        return () => {
            this.stateSyncer.installAppToTeam(appId, currentTeamId);
        };
    };

    private handleAppRemoveBtnClicked = (
        app: AppNode,
        currentTeamId: number,
    ) => {
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

        const latestAppVersions = this.graphSource.latestAppVersions(
            currentTeamId,
            this.state.tags,
        );
        return (
            <>
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
                                            onClick={this.handleAppRemoveBtnClicked(
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
                                            onClick={this.handleAppInstallBtnClicked(
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
