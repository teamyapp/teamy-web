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

import styles from './CreateProjectModal.component.module.scss';

interface Props {
    deps: Deps;
}

export interface CreateProjectModalComponentHandle {
    open: () => void;
}

interface CreateProjectInput {
    name: string;
    expectedStartDate?: string;
    expectedEndDate?: string;
}

export const CreateProjectModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<CreateProjectModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<CreateProjectModalComponentHandle>) => {
        const modalRef: RefObject<ModalUI> = createRef();
        const [createProjectInput, setCreateProjectInput] =
            useState<CreateProjectInput>({
                name: '',
            });
        const projectNameInputRef: RefObject<TextFieldUI> = useRef(null);

        const localStore: LocalStore = props.deps.localStore;
        const stateSyncer: StateSyncer = props.deps.stateSyncer;

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

        const onCreateClick = async () => {
            const teamId = localStore.getState().currTeamId;
            if (teamId && createProjectInput?.name) {
                setCreateProjectInput({
                    name: '',
                });
            }

            modalRef.current?.close();
        };

        const onNameChange = (name: string) => {
            setCreateProjectInput({
                ...createProjectInput,
                name,
            });
        };

        const onExpectedStartDateChange = (expectedStartDate: string) => {
            setCreateProjectInput({
                ...createProjectInput,
                expectedStartDate,
            });
        };

        const onExpectedEndDateChange = (expectedEndDate: string) => {
            setCreateProjectInput({
                ...createProjectInput,
                expectedEndDate,
            });
        };

        return (
            <ModalUI ref={modalRef}>
                <div className={styles.Header}>
                    Create Project
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
                            value={createProjectInput?.name}
                            onChange={onNameChange}
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            label='Expected Start Date'
                            value={createProjectInput?.expectedStartDate}
                            onChange={onExpectedStartDateChange}
                            placeholder='YYYY/MM/DD HH:MM:SS'
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            label='Expected End Date'
                            value={createProjectInput?.expectedEndDate}
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
