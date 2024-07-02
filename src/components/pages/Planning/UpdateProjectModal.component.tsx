import moment from 'moment';
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
import { Project } from '@core/entity/project';
import { formatDate } from '@lib/time/date';
import styles from './UpdateProjectModal.component.module.scss';

interface Props {
    deps: Deps;
    project: Project;
}

export interface UpdateProjectModalComponentHandle {
    open: () => void;
}

interface UpdateProjectInput {
    name: string;
    expectedStartAt: string;
    expectedEndAt: string;
}

export const UpdateProjectModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<UpdateProjectModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<UpdateProjectModalComponentHandle>) => {
        const modalRef: RefObject<ModalUI> = createRef();
        const [updateProjectInput, setUpdateProjectInput] =
            useState<UpdateProjectInput>({
                name: props.project.name,
                expectedStartAt: formatDate(props.project.expectedStartAt),
                expectedEndAt: formatDate(props.project.expectedEndAt),
            });
        const projectNameInputRef: RefObject<TextFieldUI> = useRef(null);

        const open = () => {
            modalRef.current?.open();
            setTimeout(() => {
                projectNameInputRef.current?.focus();
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
                updateProjectInput?.name &&
                updateProjectInput?.expectedStartAt &&
                updateProjectInput?.expectedEndAt
            ) {
                await props.deps.stateSyncer.updateProject(props.project.id, {
                    name: updateProjectInput.name,
                    expectedStartAt: moment(
                        updateProjectInput.expectedStartAt,
                    ).toDate(),
                    expectedEndAt: moment(
                        updateProjectInput.expectedEndAt,
                    ).toDate(),
                });

                setUpdateProjectInput({
                    name: '',
                    expectedStartAt: '',
                    expectedEndAt: '',
                });
            }

            modalRef.current?.close();
        };

        const onNameChange = (name: string) => {
            setUpdateProjectInput({
                ...updateProjectInput,
                name,
            });
        };

        const onExpectedStartDateChange = (expectedStartAt: string) => {
            setUpdateProjectInput({
                ...updateProjectInput,
                expectedStartAt,
            });
        };

        const onExpectedEndDateChange = (expectedEndAt: string) => {
            setUpdateProjectInput({
                ...updateProjectInput,
                expectedEndAt,
            });
        };

        return (
            <ModalUI ref={modalRef}>
                <div className={styles.Header}>
                    Update Project
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
                    <div className={styles.ProjectName}>
                        <TextFieldUI
                            ref={projectNameInputRef}
                            label={'Name'}
                            value={updateProjectInput?.name}
                            onChange={onNameChange}
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            label='Expected Start Date'
                            value={updateProjectInput?.expectedStartAt}
                            onChange={onExpectedStartDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            label='Expected End Date'
                            value={updateProjectInput?.expectedEndAt}
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
