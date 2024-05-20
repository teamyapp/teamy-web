import { Deps } from '@core/dep/deps';
import { ModalUI } from '@lib/ui/Modal';
import {
    ForwardRefExoticComponent,
    ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { TextFieldUI } from '@lib/ui/TextField';
import { ButtonUI } from '@lib/ui/Button';
import { CreateTaskLinkInput } from '@core/entity/input';
import styles from './CreateTaskLinkModal.component.module.scss';

interface Props {
    deps: Deps;
    taskId: number;
}

export interface CreateTaskLinkModalComponentHandle {
    open: () => void;
}

export const CreateTaskLinkModalComponent: ForwardRefExoticComponent<
    Props & React.RefAttributes<CreateTaskLinkModalComponentHandle>
> = forwardRef(
    (props: Props, ref: ForwardedRef<CreateTaskLinkModalComponentHandle>) => {
        const taskLinkTitleInputRef = useRef<TextFieldUI>(null);
        const [createTaskLinkInput, setCreateTaskLinkInput] =
            useState<CreateTaskLinkInput>({
                title: '',
                previewTitle: '',
                url: '',
            });
        const modalRef = useRef<ModalUI>(null);
        const onCreateClick = async () => {
            if (!createTaskLinkInput.title) {
                await props.deps.feedbackPubSub.publish({
                    type: 'Dynamic',
                    children: 'Title is required',
                });
                return;
            }

            if (!createTaskLinkInput.url) {
                await props.deps.feedbackPubSub.publish({
                    type: 'Dynamic',
                    children: 'Url is required',
                });
                return;
            }

            if (!createTaskLinkInput.previewTitle) {
                await props.deps.feedbackPubSub.publish({
                    type: 'Dynamic',
                    children: 'Preview Title is required',
                });
                return;
            }

            props.deps.stateSyncer.createTaskLink(
                props.taskId,
                createTaskLinkInput,
            );
            modalRef.current?.close();
        };

        const open = () => {
            setCreateTaskLinkInput({
                title: '',
                previewTitle: '',
                url: '',
            });
            taskLinkTitleInputRef.current?.focus();
            modalRef.current?.open();
        };

        useImperativeHandle(ref, () => ({
            open,
        }));
        const onTaskLinkTitleChange = (title: string) => {
            setCreateTaskLinkInput({
                ...createTaskLinkInput,
                title,
            });
        };

        const onTaskLinkPreviewTitleChange = (previewTitle: string) => {
            setCreateTaskLinkInput({
                ...createTaskLinkInput,
                previewTitle,
            });
        };

        const onTaskLinkUrlChange = (url: string) => {
            setCreateTaskLinkInput({
                ...createTaskLinkInput,
                url,
            });
        };

        const onTaskLinkIconUrlChange = (iconUrl: string) => {
            setCreateTaskLinkInput({
                ...createTaskLinkInput,
                iconUrl,
            });
        };

        const onTaskLinkHoverIconUrlChange = (iconHoverUrl: string) => {
            setCreateTaskLinkInput({
                ...createTaskLinkInput,
                iconHoverUrl,
            });
        };

        return (
            <ModalUI ariaLabel={'Create Task Link'} ref={modalRef} level={2}>
                <div className={styles.Header}>
                    Create Task Link
                    <div
                        role={'button'}
                        aria-label={'Close'}
                        className={styles.CloseButton}
                        onClick={modalRef.current?.close}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.TaskLinkTitle}>
                        <TextFieldUI
                            label={'Title'}
                            ref={taskLinkTitleInputRef}
                            value={createTaskLinkInput.title}
                            onChange={onTaskLinkTitleChange}
                        />
                    </div>
                    <div className={styles.TaskLinkPreviewTitle}>
                        <TextFieldUI
                            value={createTaskLinkInput.previewTitle}
                            onChange={onTaskLinkPreviewTitleChange}
                            label={'Preview Title'}
                        />
                    </div>
                    <div className={styles.TaskLinkUrl}>
                        <TextFieldUI
                            value={createTaskLinkInput.url}
                            onChange={onTaskLinkUrlChange}
                            label={'Link url'}
                        />
                    </div>
                    <div className={styles.TaskLinkIconUrl}>
                        <TextFieldUI
                            value={createTaskLinkInput.iconUrl}
                            onChange={onTaskLinkIconUrlChange}
                            label={'Icon url'}
                        />
                    </div>
                    <div className={styles.TaskLinkHoverIconUrl}>
                        <TextFieldUI
                            value={createTaskLinkInput.iconHoverUrl}
                            onChange={onTaskLinkHoverIconUrlChange}
                            label={'Icon Hover url'}
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
