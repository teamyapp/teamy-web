import { TooltipUI } from '@lib/ui/Tooltip';
import React, { Component, ReactNode, createRef } from 'react';

import * as csp from '@lib/csp/csp';
import { closeIfNot } from '@lib/csp/lib';
import { RelativeLayout } from '@lib/layout/relativeLayout';
import { PubSub } from '@lib/pubSub/pubSub';
import { Duration } from '@lib/time/duration';
import { DateTextPickerUI } from '@lib/ui/DateTextPicker';
import { MarkdownEditorUI } from '@lib/ui/MarkdownEditor';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { Feedback } from '@core/entity/feedback';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { GraphSource } from '@core/storage/graph/graphSource';
import { LocalStore } from '@core/storage/syncer/localStore';
import { StateSyncer } from '@core/storage/syncer/stateSyncer';

import { DurationInputUI } from '../DurationInput.ui';
import { SelectOwnersPopupComponent } from '../SelectOwnersPopupComponent';
import { TaskLinkIconUI } from '../TaskLinkIcon';
import { ThreadUI } from '../Thread';
import styles from './TaskDetailModal.component.module.scss';
import { getPlatform } from '@lib/runtime/os';
import { CreateTaskLinkModalComponent, CreateTaskLinkModalComponentHandle } from './CreateTaskLinkModal.component';

const verticalMargin = 30;
const POPUP_Z_INDEX = 1002;

interface Props {
    deps: Deps;
    afterClose?: () => void;
}

interface State {
    task?: Task;
    updatedTask?: UpdateTaskInput;
    currentUserId?: number;
    heightWithMargin: number;
    isCmdKeyPressed: boolean;
    isControlKeyPressed: boolean;
}

export class TaskDetailModalComponent extends Component<Props, State> {
    private readonly localStore: LocalStore;
    private readonly graphSource: GraphSource;
    private readonly stateSyncer: StateSyncer;
    private readonly feedbackPubSub: PubSub<Feedback>;
    private readonly relativeLayout: RelativeLayout;
    private readonly modalRef = createRef<ModalUI>();
    private readonly createTaskLinkModalRef = createRef<CreateTaskLinkModalComponentHandle>();
    private readonly markdownEditorRef = createRef<MarkdownEditorUI>();
    private readonly threadDivRef = createRef<HTMLDivElement>();
    private readonly dueAtDatePicker = createRef<DateTextPickerUI>();
    private stateChangeChan?: csp.PopChannel<boolean | undefined>;

    constructor(props: Props) {
        super(props);
        this.localStore = props.deps.localStore;
        this.graphSource = props.deps.graphSource;
        this.stateSyncer = props.deps.stateSyncer;
        this.feedbackPubSub = props.deps.feedbackPubSub;
        this.relativeLayout = props.deps.relativeLayout;
        this.state = {
            heightWithMargin: 0,
            isCmdKeyPressed: false,
            isControlKeyPressed: false,
        };
    }

    public render(): ReactNode {
        const dueAt = this.state.updatedTask?.dueAt
            ? new Date(this.state.updatedTask.dueAt)
            : undefined;
        return (
            <>
                <ModalUI ref={this.modalRef} afterClose={this.props.afterClose}>
                    {this.state.updatedTask && this.state.task && (
                        <div
                            className={styles.ModalContent}
                            style={{
                                height:
                                    this.state.heightWithMargin -
                                    2 * verticalMargin,
                            }}
                        >
                            <div className={styles.Header}>
                                Task #{this.state.task.id}
                                <div
                                    className={styles.CloseButton}
                                    onClick={this.onCloseButtonClick}
                                >
                                    <MaterialIconUI>cancel</MaterialIconUI>
                                </div>
                            </div>
                            <div className={styles.TaskActionsSection}>
                                {this.renderSaveShortcutDescription()}
                                <SelectOwnersPopupComponent
                                    deps={this.props.deps}
                                    onSelectOwner={this.onTaskOwnerSelected}
                                    selectedOwner={this.state.task?.owner}
                                    zOffset={POPUP_Z_INDEX}
                                />
                            </div>
                            <div className={styles.TaskDetailSection}>
                                <div className={styles.LeftSection}>
                                    <div>
                                        <TextFieldUI
                                            value={this.state.updatedTask.goal}
                                            label={'Goal'}
                                            showLengthCounter={true}
                                            maxLength={taskGoalLengthLimit}
                                            onChange={this.onTextFieldChangeHandler(
                                                'goal',
                                            )}
                                        />
                                    </div>
                                    <div className={styles.Context}>
                                        <MarkdownEditorUI
                                            label={'Context'}
                                            content={
                                                this.state.updatedTask.context
                                            }
                                            ref={this.markdownEditorRef}
                                        />
                                    </div>
                                    <div className={styles.LinksSection}>
                                        <div className={styles.Title}>
                                            <div className={styles.Name}>
                                                Links&nbsp;(
                                                {this.state.task.links.length})
                                            </div>
                                            <div className={styles.Actions}>
                                                <TooltipUI
                                                    message='Create link'
                                                    relativeLayout={
                                                        this.props.deps
                                                            .relativeLayout
                                                    }
                                                >
                                                    <div
                                                        onClick={
                                                            this
                                                                .handleTaskLinkModalOpen
                                                        }
                                                        className={`${styles.Action} ${styles.Create}`}
                                                    >
                                                        <MaterialIconUI>
                                                            add
                                                        </MaterialIconUI>
                                                    </div>
                                                </TooltipUI>
                                            </div>
                                        </div>
                                        {this.state.task.links.map((link) => (
                                            <div className={styles.Link} key={link.id}>
                                                <TaskLinkIconUI
                                                    link={link}
                                                    relativeLayout={
                                                        this.props.deps
                                                            .relativeLayout
                                                    }
                                                />
                                                <a
                                                    href={link.url}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                >
                                                    {link.title}
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                    <div className={styles.CommentsSection}>
                                        <div className={styles.Title}>
                                            Comments&nbsp;(
                                            {
                                                this.state.task.comments
                                                    .messages.length
                                            }
                                            )
                                        </div>
                                        <div
                                            ref={this.threadDivRef}
                                            className={styles.Thread}
                                        >
                                            <ThreadUI
                                                messages={
                                                    this.state.task.comments
                                                        .messages
                                                }
                                                editorUserId={
                                                    this.state.currentUserId!
                                                }
                                                postButtonLabel={'Comment'}
                                                onPostMessage={
                                                    this.onPostComment
                                                }
                                                onDeleteMessage={
                                                    this.onDeleteMessage
                                                }
                                                onUpdateMessage={
                                                    this.onUpdateMessage
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.RightSection}>
                                    <div className={styles.Attributes}>
                                        {!this.state.task.deliveredAt && (
                                            <div className={styles.Row}>
                                                <DateTextPickerUI
                                                    relativeLayout={
                                                        this.props.deps
                                                            .relativeLayout
                                                    }
                                                    ref={this.dueAtDatePicker}
                                                    label={'Due at'}
                                                    value={dueAt}
                                                    zOffset={POPUP_Z_INDEX}
                                                />
                                            </div>
                                        )}
                                        {this.state.task.deliveredAt && (
                                            <div
                                                className={`${styles.Row} ${styles.DeliveredAt}`}
                                            >
                                                <div className={styles.Label}>
                                                    Delivered at:
                                                </div>
                                                <div className={styles.Value}>
                                                    {new Date(
                                                        this.state.task.deliveredAt,
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`${styles.Row} ${styles.Effort}`}
                                        >
                                            <DurationInputUI
                                                relativeLayout={
                                                    this.relativeLayout
                                                }
                                                duration={
                                                    this.state.updatedTask
                                                        .effort
                                                }
                                                canClear={true}
                                                zOffset={POPUP_Z_INDEX}
                                                icon={
                                                    <MaterialIconUI
                                                        iconStyle={'outlined'}
                                                    >
                                                        weight
                                                    </MaterialIconUI>
                                                }
                                                onDurationChange={
                                                    this.onEffortChange
                                                }
                                                transformReferenceContainer={({
                                                    showFollower,
                                                    container,
                                                }) => (
                                                    <TooltipUI
                                                        relativeLayout={
                                                            this.props.deps
                                                                .relativeLayout
                                                        }
                                                        preserveReferenceParentHeight={
                                                            true
                                                        }
                                                        disabled={showFollower}
                                                        message={'Effort'}
                                                    >
                                                        {container}
                                                    </TooltipUI>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalUI>
                {this.state.task && (
                    <CreateTaskLinkModalComponent
                        ref={this.createTaskLinkModalRef}
                        deps={this.props.deps}
                        taskId={this.state.task?.id}
                    />
                )}
            </>
        );
    }

    public componentDidMount() {
        window.addEventListener('resize', this.onBodyResize);
        document.addEventListener('keydown', this.onKeyDown);
        document.addEventListener('keyup', this.onKeyUp);
        this.stateChangeChan = this.localStore.subscribeStateChange();
        (async () => {
            while (true) {
                console.log(
                    '[TaskDetailModalComponent] waiting for state changes',
                );
                const hasChanged = await this.stateChangeChan!.pop();
                if (hasChanged === undefined) {
                    // check undefined instead of falsy because
                    // a falsy data could be valid data per channel's concern.
                    return;
                }

                if (this.state.task?.id) {
                    this.updateState(this.state.task.id);
                }
            }
        })().then();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.onBodyResize);
        document.removeEventListener('keydown', this.onKeyDown);
        document.removeEventListener('keyup', this.onKeyUp);
        closeIfNot(this.stateChangeChan);
    }

    public async open(taskId: number) {
        const syncPromise = this.stateSyncer.pullTask(taskId);
        this.setState(
            {
                task: undefined,
            },
            async () => {
                this.modalRef.current?.open();
                await syncPromise;
                this.updateState(taskId);
                this.adjustSize();
                this.scrollToCommentsBottom();
            },
        );
    }

    public close() {
        this.modalRef.current?.close();
    }

    private updateState(taskId: number) {
        const task = this.graphSource.task(taskId);
        if (!task) {
            this.setState({
                task: undefined,
                updatedTask: undefined,
            });
            return;
        }
        this.setState({
            task,
            updatedTask: {
                goal: task.goal,
                context: task.context,
                ownerUserId: task.owner?.id,
                owningTeamId: task.owningTeam.id,
                effort: task.effort,
                dueAt: task.dueAt,
            },
            currentUserId: this.graphSource.currentUser()?.id,
        });
    }

    private renderSaveShortcutDescription() {
        const platform = getPlatform();
        let cmdKey = platform === 'Mac' ? 'cmd' : 'ctrl';
        return (
            <div className={styles.Description}>
                Press {cmdKey} + s to save changes
            </div>
        );
    }

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onBodyResize = () => {
        this.adjustSize();
    };

    private onKeyDown = (event: KeyboardEvent) => {
        const platform = getPlatform();
        if (platform === 'Mac' && event.metaKey) {
            this.setState({
                isCmdKeyPressed: true,
            });
        }

        if (platform === 'Windows' && event.key === 'Control') {
            this.setState({
                isControlKeyPressed: true,
            });
        }

        if (
            (this.state.isCmdKeyPressed || this.state.isControlKeyPressed) &&
            event.key === 's'
        ) {
            event.preventDefault();
            this.onSaveButtonClick();
        }
    };

    private onKeyUp = (event: KeyboardEvent) => {
        const platform = getPlatform();
        if (platform === 'Mac' && !event.metaKey) {
            this.setState({
                isCmdKeyPressed: false,
            });
        }

        if (platform === 'Windows' && event.key === 'Control') {
            this.setState({
                isControlKeyPressed: false,
            });
        }
    };

    private adjustSize() {
        this.setState({
            heightWithMargin: document.body.clientHeight,
        });
    }

    private onSaveButtonClick = async () => {
        if (this.state.task) {
            await this.stateSyncer.updateTask(
                this.state.task.id,
                this.getUpdatedTaskInput(),
            );
            await this.feedbackPubSub.publish({
                type: 'TaskUpdated',
                taskId: this.state.task.id,
            });
        }
    };

    private onTaskOwnerSelected = (ownerUserId?: number) => {
        this.stateSyncer.updateTask(this.state.task!.id, {
            ...this.getUpdatedTaskInput(),
            ownerUserId,
        });
    };

    private onTextFieldChangeHandler(taskProp: string) {
        return (newValue: string) => {
            this.setState({
                updatedTask: Object.assign({}, this.state.updatedTask, {
                    [taskProp]: newValue,
                }),
            });
        };
    }

    private onPostComment = async (body: string) => {
        await this.stateSyncer.createMessage(this.state.task!.comments.id, {
            body,
        });
        this.scrollToCommentsBottom();
    };

    private onDeleteMessage = async (messageId: number) => {
        await this.stateSyncer.deleteMessage(messageId);
    };

    private onUpdateMessage = async (messageId: number, body: string) => {
        await this.stateSyncer.updateMessage(messageId, {
            body,
        });
    };

    private scrollToCommentsBottom() {
        const threadDivEl = this.threadDivRef.current;
        threadDivEl?.scrollTo(0, threadDivEl?.scrollHeight);
    }

    private onEffortChange = async (effort?: Duration) => {
        await this.stateSyncer.updateTask(this.state.task!.id, {
            ...this.getUpdatedTaskInput(),
            effort: effort,
        });
        await this.props.deps.feedbackPubSub.publish({
            type: 'TaskUpdated',
            taskId: this.state.task!.id,
        });
    };

    private getUpdatedTaskInput(): UpdateTaskInput {
        const dueAt = this.dueAtDatePicker.current?.value || undefined;
        const task = this.state.task!;
        return {
            goal: this.state.updatedTask!.goal,
            context: this.markdownEditorRef.current?.content,
            ownerUserId: task.owner?.id,
            owningTeamId: task.owningTeam.id,
            dueAt: dueAt,
            effort: task.effort,
        };
    }

    private handleTaskLinkModalOpen = () => {
        this.createTaskLinkModalRef.current?.open();
    };
}
