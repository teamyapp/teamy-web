import React, { Component, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreateTeamModal.component.module.scss';

interface Props {
    deps: Deps;
}

export class CreateTeamModalComponent extends Component<Props> {
    private readonly stateSyncer: StateSyncer;
    private readonly modalRef = createRef<ModalUI>();
    private readonly teamNameInputRef = createRef<TextFieldUI>();

    constructor(props: Props) {
        super(props);
        this.stateSyncer = props.deps.stateSyncer;
    }

    public render() {
        return (
            <ModalUI
                ariaLabel={'Create Team'}
                ref={this.modalRef}
                level={1}>
                <div className={styles.Header}>
                    Create Team
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
                    <div className={styles.TeamName}>
                        <TextFieldUI
                            ref={this.teamNameInputRef}
                            label={'Name'}
                        />
                    </div>
                    <div className={styles.AddAction}>
                        <ButtonUI
                            label={'Create'}
                            onClick={this.onCreateClick}
                        />
                    </div>
                </div>
            </ModalUI>
        );
    }

    public open = async () => {
        this.modalRef.current?.open();
        setTimeout(() => {
            this.teamNameInputRef.current?.focus();
        });
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onCreateClick = async () => {
        const teamName = this.teamNameInputRef.current?.value;
        if (!teamName) {
            alert('Team name cannot be empty');
            return;
        }

        this.modalRef.current?.close();
        await this.stateSyncer.createTeam({
            name: teamName,
        });
    };
}
