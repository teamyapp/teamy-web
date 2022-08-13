import React, { Component, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DatePickerUI } from '@lib/ui/DatePicker';
import { DropDownList } from '@lib/ui/DropDownList';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { Deps } from '@core/dep/deps';
import { CreateSprintInput } from '@core/entity/input';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreateSprintModal.component.module.scss';
import { Duration, DURATION_DESCRIPTIONS, getEndAt } from '../duration.format';

const SPRINT_DURATIONS: Duration[] = [
    '1weeks',
    '2weeks'
]

interface Props {
    deps: Deps;
}

export class CreateSprintModalComponent extends Component<Props> {
    private readonly localStore: LocalStore;
    private readonly stateSyncer: StateSyncer;
    private readonly modalRef = createRef<ModalUI>();
    private readonly startDateInputRef = createRef<DatePickerUI>();
    private readonly sprintLengthInputRef = createRef<DropDownList>();

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.stateSyncer = props.deps.stateSyncer;
    }

    public render() {
        return (
            <ModalUI ref={this.modalRef} level={1}>
                <div className={styles.Header}>
                    Create Sprint
                    <div
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.StartDate}>
                        <DatePickerUI
                            label={'Start Date'}
                            ref={this.startDateInputRef}
                            value={new Date()}
                        />
                    </div>
                    <div className={styles.SprintLength}>
                        <div className={styles.Label}>Sprint length: </div>
                        <DropDownList
                            selectOptionKey={'1weeks'}
                            ref={this.sprintLengthInputRef}
                            options={SPRINT_DURATIONS.map(
                                (duration) => ({
                                    key: duration,
                                    description:
                                    DURATION_DESCRIPTIONS[duration],
                                }),
                            )}
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
            this.startDateInputRef.current?.focus();
        });
    };

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onCreateClick = async () => {
        const startAt = this.startDateInputRef.current?.value;
        if (!startAt) {
            alert('Start date cannot be empty');
            return;
        }

        const duration = this.sprintLengthInputRef.current?.value;
        if (!duration) {
            return;
        }

        const teamId = this.localStore.getState().currTeamId;
        const sprintInput: CreateSprintInput = {
            startAt: startAt,
            endAt: getEndAt(startAt, duration as Duration),
        };

        const sprintId = await this.stateSyncer.createSprint(
            teamId!,
            sprintInput,
        );
        this.stateSyncer.trySetCurrentSprint(sprintId);
        this.modalRef.current?.close();
    };
}
