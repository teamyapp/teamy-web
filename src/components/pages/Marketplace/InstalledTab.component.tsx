import { Component, createRef } from 'react';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './InstalledTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import { formatCount } from './format';

interface Props {
    deps: Deps;
}

interface State {}

export class InstalledTabComponent extends Component<Props, State> {
    private readonly appSettingModalRef = createRef<AppSettingModalComponent>();
    private readonly graphSource: GraphSource;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
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
                                <div className={styles.Icon}>
                                    <img src={item.activeAppVersion.iconUrl} />
                                </div>
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
                <AppSettingModalComponent ref={this.appSettingModalRef} />
            </>
        );
    }

    private onAppSettingButtonClickHandler = (appId: number) => {
        return () => {
            this.appSettingModalRef.current?.open(appId);
        };
    };
}
