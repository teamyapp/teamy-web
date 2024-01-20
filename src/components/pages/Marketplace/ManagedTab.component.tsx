import { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './ManagedTab.component.module.scss';
import { CreateAppModalComponent } from './Modals/CreateAppModal.component';
import { ManageAppModalComponent } from './Modals/ManageAppModal/ManageAppModal.component';
import { LocalStore } from '@core/storage/syncer/localStore';

interface Props {
    deps: Deps;
}

export class ManagedTabComponent extends Component<Props> {
    private readonly createAppModalRef = createRef<CreateAppModalComponent>();
    private readonly manageAppModalRef = createRef<ManageAppModalComponent>();
    private readonly graphSource: GraphSource;
    private readonly localStore: LocalStore;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.localStore = props.deps.localStore;
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
                        const currentTeamAppVersion = app.latestVersionForTeam(this.localStore.getState().currTeamId)
                        if (!currentTeamAppVersion) {
                            return null;
                        }

                        return (
                            <div className={styles.InlineItem} key={app.id}>
                                <div className={styles.LeftSection}>
                                    <div className={styles.Icon}>
                                        <img
                                            src={currentTeamAppVersion.iconUrl}
                                        />
                                    </div>
                                </div>
                                <div className={styles.MiddleSection}>
                                    <div className={styles.Name}>
                                        {currentTeamAppVersion.appName}
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
}
