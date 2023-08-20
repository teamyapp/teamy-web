import React, { Component, RefObject, createRef } from 'react';

import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import styles from './AppSettingModal.component.module.scss';

interface App {
    id: number;
    name: string;
}

const apps: Record<number, App> = {
    1: {
        id: 1,
        name: 'Github',
    },
    2: {
        id: 2,
        name: 'Slack',
    },
};

interface Props {}

interface State {
    app?: App;
}

export class AppSettingModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly contentRef: RefObject<HTMLDivElement> = createRef();

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            this.state.app && (
                <ModalUI ref={this.modalRef}>
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
            () => {
                this.modalRef.current?.open();
            },
        );
    }

    close() {
        this.modalRef.current?.close();
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };
}
