import { CleanupFunc, ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { App } from '@core/entity/app';
import { GraphSource } from '@core/storage/graph/graphSource';

import styles from './AppSettingModal.component.module.scss';

interface Props {
    deps: Deps;
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {
    app?: App;
}

export class AppSettingModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly contentRef = createRef<HTMLDivElement>();
    private readonly graphSource: GraphSource;
    private cleanupFunc?: CleanupFunc;

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {};
    }

    render() {
        if (!this.state.app) {
            return null;
        }

        const currentTeam = this.graphSource.currentTeam();
        if (!currentTeam) {
            return null;
        }

        const latestAppVersion = this.state.app.latestVersionForTeam(
            currentTeam.id,
        );
        if (!latestAppVersion) {
            return null;
        }

        return (
            <ModalUI ref={this.modalRef} afterClose={this.afterModalClose}>
                <div className={styles.Header}>
                    Settings for {latestAppVersion.appName}
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content} ref={this.contentRef} />
            </ModalUI>
        );
    }

    open(appId: number) {
        const app = this.graphSource.app(appId);
        this.setState(
            {
                app,
            },
            async () => {
                await this.modalRef.current?.open();
                if (!this.contentRef.current) {
                    return;
                }

                const thirdPartyAppEventHub =
                    this.props.thirdPartyAppEventHubs.find(
                        (hub) => hub.appId === this.state.app?.id,
                    );
                this.cleanupFunc = thirdPartyAppEventHub?.onShowAppSetting(
                    this.contentRef.current,
                );
            },
        );
    }

    private afterModalClose = () => {
        this.cleanupFunc?.();
    };

    close() {
        this.modalRef.current?.close();
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };
}
