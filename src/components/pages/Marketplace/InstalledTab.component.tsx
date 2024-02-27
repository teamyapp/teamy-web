import { ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, createRef } from 'react';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';
import {AppIconComponent} from './AppIcon.component';

import styles from './InstalledTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import { formatCount } from './format';
import { FileClient } from '@core/client/file.client';
import { APP_VERSION_ICON_SIZE } from '@core/storage/graph/appVersion.node';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {}

export class InstalledTabComponent extends Component<Props, State> {
    private readonly appSettingModalRef = createRef<AppSettingModalComponent>();
    private readonly graphSource: GraphSource;
    private readonly fileClient: FileClient;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.fileClient = props.deps.fileClient;
    }

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
                                    appIconUrl={this.fileClient.getRemoteFileUrl(item.activeAppVersion.iconPath(APP_VERSION_ICON_SIZE))}/>
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
                                        item.id,
                                    )}
                                >
                                    Setting
                                </div>
                                <div
                                    className={`${styles.Button}  ${styles.Remove}`}
                                >
                                    Remove
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <AppSettingModalComponent
                    ref={this.appSettingModalRef}
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
