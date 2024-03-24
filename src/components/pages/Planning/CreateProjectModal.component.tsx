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
    Props & React.RefAttributes<CreateProjectModalComponentHandler>
> = forwardRef(
    (props: Props, ref: ForwardedRef<CreateProjectModalComponentHandler>) => {
        const modalRef: RefObject<ModalUI> = createRef();
        const [createProjectInput, setCreateProjectInput] =
            useState<CreateProjectUIInput>({
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
                })
            }

            modalRef.current?.close();
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
                            value={createProjectInput?.name}
                            onChange={(newValue) =>
                                setCreateProjectInput({
                                    ...createProjectInput,
                                    name: newValue,
                                })
                            }
                            label={'Name'}
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            value={createProjectInput?.expectedEndDate}
                            onChange={(newValue) =>
                                setCreateProjectInput({
                                    ...createProjectInput,
                                    expectedStartDate: newValue,
                                })
                            }
                            placeholder='YYYY/MM/DD HH:MM:SS'
                            label='Expected Start Date'
                        />
                    </div>
                    <div className={styles.ProjectDate}>
                        <TextFieldUI
                            value={createProjectInput?.expectedEndDate}
                            onChange={(newValue) =>
                                setCreateProjectInput({
                                    ...createProjectInput,
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
