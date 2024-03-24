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

interface CreateProjectInput {
    name: string;
    expectedStartDate?: string;
    expectedEndDate?: string;
}

export const CreatePhaseModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<CreatePhaseModalComponentHandler>
> = forwardRef(
    (props: Props, ref: ForwardedRef<CreatePhaseModalComponentHandler>) => {
        const localStore: LocalStore = props.deps.localStore;
        const stateSyncer: StateSyncer = props.deps.stateSyncer;
        const modalRef: RefObject<ModalUI> = createRef();
        const [createPhaseInput, setCreatePhaseInput] =
            useState<CreateProjectUIInput>({
                name: '',
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
                })
            }

            modalRef.current?.close();
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
                            value={createPhaseInput?.name}
                            onChange={(newValue) =>
                                setCreatePhaseInput({
                                    ...createPhaseInput,
                                    name: newValue,
                                })
                            }
                            label={'Name'}
                        />
                    </div>
                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            value={createPhaseInput?.expectedEndDate}
                            onChange={(newValue) =>
                                setCreatePhaseInput({
                                    ...createPhaseInput,
                                    expectedStartDate: newValue,
                                })
                            }
                            placeholder='YYYY/MM/DD HH:MM:SS'
                            label='Expected Start Date'
                        />
                    </div>

                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            value={createPhaseInput?.expectedEndDate}
                            onChange={(newValue) =>
                                setCreatePhaseInput({
                                    ...createPhaseInput,
                                    expectedEndDate: newValue,
                                })
                            }
                            placeholder='YYYY/MM/DD HH:MM:SS'
                            label='Expected End Date'
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
