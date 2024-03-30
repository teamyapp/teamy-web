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

import { formatDate } from '@lib/time/date';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { Phase, PhaseStatus } from '@core/entity/phase';

import styles from './UpdatePhaseModal.component.module.scss';

interface Props {
    deps: Deps;
    phase: Phase;
}

export interface UpdatePhaseModalComponentHandle {
    open: () => void;
}

interface UpdatePhaseInput {
    name: string;
    expectedStartAt: string;
    expectedEndAt: string;
    status: PhaseStatus;
}

export const UpdatePhaseModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<UpdatePhaseModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<UpdatePhaseModalComponentHandle>) => {
        const modalRef: RefObject<ModalUI> = createRef();
        const [updatePhaseInput, setUpdatePhaseInput] =
            useState<UpdatePhaseInput>({
                name: props.phase.name,
                expectedStartAt: formatDate(props.phase.expectedStartAt),
                expectedEndAt: formatDate(props.phase.expectedEndAt),
                status: props.phase.status,
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

        const onUpdateClick = async () => {
            if (updatePhaseInput.name && updatePhaseInput.expectedStartAt && updatePhaseInput.expectedEndAt && updatePhaseInput.status) {
                await props.deps.stateSyncer.updatePhase(props.phase.id, {
                    name: updatePhaseInput.name,
                    expectedStartAt: new Date(updatePhaseInput.expectedStartAt),
                    expectedEndAt: new Date(updatePhaseInput.expectedEndAt),
                    status: updatePhaseInput.status,
                });

                setUpdatePhaseInput({
                    name: '',
                    expectedStartAt: '',
                    expectedEndAt: '',
                    status: 'TODO',
                });
            }

            modalRef.current?.close();
        };

        const onNameChange = (name: string) => {
            setUpdatePhaseInput({
                ...updatePhaseInput,
                name,
            });
        };

        const onExpectedStartDateChange = (expectedStartAt: string) => {
            setUpdatePhaseInput({
                ...updatePhaseInput,
                expectedStartAt,
            });
        };

        const onExpectedEndDateChange = (expectedEndAt: string) => {
            setUpdatePhaseInput({
                ...updatePhaseInput,
                expectedEndAt,
            });
        };

        return (
            <ModalUI ref={modalRef}>
                <div className={styles.Header}>
                    Update Phase
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
                            value={updatePhaseInput?.name}
                            onChange={onNameChange}
                        />
                    </div>
                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            label='Expected Start Date'
                            value={updatePhaseInput?.expectedStartAt}
                            onChange={onExpectedStartDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>

                    <div className={styles.PhaseDate}>
                        <TextFieldUI
                            label='Expected End Date'
                            value={updatePhaseInput?.expectedEndAt}
                            onChange={onExpectedEndDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>
                    <div className={styles.UpdateAction}>
                        <ButtonUI label={'Update'} onClick={onUpdateClick} />
                    </div>
                </div>
            </ModalUI>
        );
    },
);
