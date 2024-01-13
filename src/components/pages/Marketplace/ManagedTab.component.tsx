import { Component, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './ManagedTab.component.module.scss';
import { CreateAppModalComponent } from './Modals/CreateAppModal.component';
import { ManageAppModalComponent } from './Modals/ManageAppModal/ManageAppModal.component';

interface Props {
    deps: Deps;
}

interface State {}

export class ManagedTabComponent extends Component<Props, State> {
    private readonly createAppModalRef = createRef<CreateAppModalComponent>();
    private readonly manageAppModalRef = createRef<ManageAppModalComponent>();
    private readonly graphSource: GraphSource;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
    }

    render() {
        const managedApps = this.graphSource.currentTeam()?.managedApps;
        if (!managedApps) {
            return null;
        }

        return (
            <>
                <div className={styles.ItemList}>
                    {managedApps.map((app) => (
                        <div className={styles.InlineItem} key={app.id}>
                            <div className={styles.LeftSection}>
                                <div className={styles.Icon}>
                                    <img
                                        src={
                                            app.latestVersionForTeam
                                                ?.iconUrl
                                        }
                                    />
                                </div>
                            </div>
                            <div className={styles.MiddleSection}>
                                <div className={styles.Name}>
                                    {app.latestVersionForTeam?.appName}
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
                    ))}
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
