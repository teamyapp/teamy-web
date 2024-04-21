import React, {
    ForwardRefExoticComponent,
    ForwardedRef,
    RefObject,
    createRef,
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';

import { formatDate } from '@lib/time/date';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { PhaseStatus } from '@core/entity/phase';

import styles from './UpdatePhaseModal.component.module.scss';
import { UpdatePhaseInput } from '@core/entity/input';

interface Props {
    updatePhaseInput: UpdatePhaseInput;
    updatePhase: (updatePhaseInput: UpdatePhaseInput) => void;
}

interface UpdatePhaseUIInput {
    name: string;
    expectedStartAt: string;
    expectedEndAt: string;
    status: PhaseStatus;
}

export interface UpdatePhaseModalComponentHandle {
    open: () => void;
}

export const UpdatePhaseModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<UpdatePhaseModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<UpdatePhaseModalComponentHandle>) => {
        const modalRef: RefObject<ModalUI> = createRef();
        const [updatePhaseInput, setUpdatePhaseInput] =
            useState<UpdatePhaseUIInput>();
        const phaseNameInputRef: RefObject<TextFieldUI> = useRef(null);

        useEffect(() => {
            setUpdatePhaseInput({
                name: props.updatePhaseInput.name,
                expectedStartAt: formatDate(
                    props.updatePhaseInput.expectedStartAt,
                ),
                expectedEndAt: formatDate(props.updatePhaseInput.expectedEndAt),
                status: props.updatePhaseInput.status,
            });
        }, [props.updatePhaseInput])

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
            if (
                updatePhaseInput?.name &&
                updatePhaseInput.expectedStartAt &&
                updatePhaseInput.expectedEndAt &&
                updatePhaseInput.status
            ) {
                await props.updatePhase({
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
            if (!updatePhaseInput) {
                return;
            }

            setUpdatePhaseInput({
                ...updatePhaseInput,
                name,
            });
        };

        const onExpectedStartDateChange = (expectedStartAt: string) => {
            if (!updatePhaseInput) {
                return
            }

            setUpdatePhaseInput({
                ...updatePhaseInput,
                expectedStartAt,
            });
        };

        const onExpectedEndDateChange = (expectedEndAt: string) => {
            if (!updatePhaseInput) {
                return;
            }

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
