import React, { Component, RefObject, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreateAppVersionModal.component.module.scss';

interface Props {
    deps: Deps;
    appId: number;
}

export class CreateAppVersionModalComponent extends Component<Props> {
    private readonly modalRef: RefObject<ModalUI> = createRef();
    private readonly appNameInputRef: RefObject<TextFieldUI> = createRef();
    private readonly descriptionInputRef: RefObject<TextFieldUI> = createRef();

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
                    Create App Version
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
                    <div className={styles.AppNameContainer}>
                        <TextFieldUI
                            ref={this.appNameInputRef}
                            label={'App Name'}
                        />
                    </div>
                    <div>
                        <TextFieldUI
                            ref={this.descriptionInputRef}
                            label={'Description'}
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
        const description = this.descriptionInputRef.current?.value;

        if (this.props.appId && appName && description) {
            await this.stateSyncer.createAppVersion(this.props.appId, {
                appName,
                description,
            });
        }

        this.modalRef.current?.close();
    };
}
