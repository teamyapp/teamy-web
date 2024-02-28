import { CleanupFunc, ThirdPartyAppEventHub } from '@teamyapp/ext';
import React, { Component, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import styles from './AppSettingModal.component.module.scss';

interface App {
    id: number;
    name: string;
}

const apps: Record<number, App> = {
    35: {
        id: 35,
        name: 'Github',
    },
    2: {
        id: 2,
        name: 'Github',
    },
};

interface Props {
    thirdPartyAppEventHubs: ThirdPartyAppEventHub[];
}

interface State {
    app?: App;
}

export class AppSettingModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly contentRef = createRef<HTMLDivElement>();
    private cleanupFunc?: CleanupFunc;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            this.state.app && (
                <ModalUI ref={this.modalRef} afterClose={this.afterModalClose}>
                    <div className={styles.Header}>
                        Settings for {this.state.app.name}
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
            )
        );
    }

    open(appId: number) {
        // TODO: fetch and render app version setting UI
        this.setState(
            {
                app: apps[appId],
            },
            async () => {
                await this.modalRef.current?.open();
                if (
                    !this.contentRef.current ||
                    !(this.contentRef.current instanceof Element)
                ) {
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
