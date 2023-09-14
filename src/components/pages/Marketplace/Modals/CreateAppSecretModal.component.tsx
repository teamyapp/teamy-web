import React, { Component, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreateAppSecretModal.component.module.scss';

interface Props {
    deps: Deps;
}

interface State {
    appId?: number;
}

export class CreateAppSecretModalComponent extends Component<Props, State> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly secretNameInputRef: RefObject<TextFieldUI> = createRef();

    private stateSyncer: StateSyncer;

    constructor(props: Props) {
        super(props);
        this.stateSyncer = props.deps.stateSyncer;
        this.state = {};
    }

    render() {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Create App Secret
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
                    <div className={styles.SecretName}>
                        <TextFieldUI
                            ref={this.secretNameInputRef}
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

    open(appId: number) {
        this.setState(
            {
                appId,
            },
            () => {
                this.modalRef.current?.open();
                setTimeout(() => {
                    this.secretNameInputRef.current?.focus();
                });
            },
        );
    }

    onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    onCreateClick = async () => {
        const secretName = this.secretNameInputRef.current?.value;
        if (this.state.appId && secretName) {
            await this.stateSyncer.createAppApiToken(this.state.appId, {
                name: secretName,
            });
        }

        this.modalRef.current?.close();
    };
}
