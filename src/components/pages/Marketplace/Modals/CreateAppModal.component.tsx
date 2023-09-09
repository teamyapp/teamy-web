import React, { Component, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreateAppModal.component.module.scss';

interface Props {
    deps: Deps;
}

export class CreateAppModalComponent extends Component<Props> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly appNameInputRef: RefObject<TextFieldUI> = createRef();

    private localStore: LocalStore;
    private stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.stateSyncer = props.deps.stateSyncer;
    }

    render() {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Create App
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.AppName}>
                        <TextFieldUI
                            ref={this.appNameInputRef}
                            label={'Name'}
                        />
                    </div>
                    <div className={styles.CreateAction}>
                        <ButtonUI
                            label={'Create'}
                            onClick={this.onCreateClick}
                        />
                    </div>
                </div>
            </ModalUI>
        );
    }

    open() {
        this.modalRef.current?.open();
        setTimeout(() => {
            this.appNameInputRef.current?.focus();
        });
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    onCreateClick = async () => {
        const appName = this.appNameInputRef.current?.value;
        const teamId = this.localStore.getState().currTeamId;
        if (teamId && appName) {
            await this.stateSyncer.createApp(teamId, {
                name: appName,
            });
        }

        this.modalRef.current?.close();
    };
}
