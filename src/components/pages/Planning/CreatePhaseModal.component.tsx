import React, {
    ForwardRefExoticComponent,
    ForwardedRef,
    RefObject,
    createRef,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import styles from './CreatePhaseModal.component.module.scss';

interface Props {
    deps: Deps;
}

export interface CreatePhaseModalComponentHandle {
    open: () => void;
}

interface CreatePhaseInput {
    name: string;
    expectedStartAt: string;
    expectedEndAt: string;
}

export const CreatePhaseModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<CreatePhaseModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<CreatePhaseModalComponentHandle>) => {
        const localStore: LocalStore = props.deps.localStore;
        const stateSyncer: StateSyncer = props.deps.stateSyncer;
        const modalRef: RefObject<ModalUI> = createRef();
        const [createPhaseInput, setCreatePhaseInput] =
            useState<CreatePhaseInput>({
                name: '',
                expectedStartAt: '',
                expectedEndAt: '',
            });
        const phaseNameInputRef: RefObject<TextFieldUI> = useRef(null);

        const open = () => {
            modalRef.current?.open();
            setTimeout(() => {
                phaseNameInputRef.current?.focus();
            });
        };

        useImperativeHandle(ref, () => ({
            open,
        }));

        const onCloseButtonClick = () => {
            modalRef.current?.close();
        };

        const onCreateClick = async () => {
            const teamId = localStore.getState().currTeamId;
            if (teamId && createPhaseInput?.name) {
                setCreatePhaseInput({
                    name: '',
                    expectedStartAt: '',
                    expectedEndAt: '',
                });
            }

            modalRef.current?.close();
        };

        const onNameChange = (name: string) => {
            setCreatePhaseInput({
                ...createPhaseInput,
                name,
            });
        };

        const onExpectedStartDateChange = (expectedStartAt: string) => {
            setCreatePhaseInput({
                ...createPhaseInput,
                expectedStartAt,
            });
        };

        const onExpectedEndDateChange = (expectedEndAt: string) => {
            setCreatePhaseInput({
                ...createPhaseInput,
                expectedEndAt,
            });
        };

        return (
            <ModalUI ref={modalRef}>
                <div className={styles.Header}>
                    Create Phase
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.PhaseName}>
                        <TextFieldUI
                            ref={phaseNameInputRef}
                            label={'Name'}
                            value={createPhaseInput?.name}
                            onChange={onNameChange}
                        />
                    </div>
                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            label='Expected Start Date'
                            value={createPhaseInput?.expectedStartAt}
                            onChange={onExpectedStartDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>

                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            label='Expected End Date'
                            value={createPhaseInput?.expectedEndAt}
                            onChange={onExpectedEndDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>
                    <div className={styles.CreateAction}>
                        <ButtonUI label={'Create'} onClick={onCreateClick} />
                    </div>
                </div>
            </ModalUI>
        );
    },
);
