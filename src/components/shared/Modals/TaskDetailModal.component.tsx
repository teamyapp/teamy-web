import classNames from 'classnames';
import React, {
    Component,
    Fragment,
    MouseEvent,
    ReactNode,
    createRef,
} from 'react';

import { DatePickerUI } from '@lib/ui/DatePicker';
import { MarkdownEditorUI } from '@lib/ui/MarkdownEditor';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';
import { TextFieldUI } from '@lib/ui/TextField';
import { BoundingBoxFinder, Rect } from '@lib/ui/position';

import { taskGoalLengthLimit } from '@core/config/config';
import { Deps } from '@core/dep/deps';
import { UpdateTaskInput } from '@core/entity/input';
import { Task } from '@core/entity/task';
import { GraphSource } from '@core/graph/graphSource';
import { FormatService } from '@core/service/format.service';

import { ThreadUI } from '../Thread';
import { UserProfileUI } from '../UserProfile';
import styles from './TaskDetailModal.component.module.scss';

const verticalMargin = 40;

interface Props {
    deps: Deps;
    taskSelectingOwner?: number;
    onClose?: () => void;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: BoundingBoxFinder,
    ) => void;
}

interface State {
    task?: Task;
    updatedTask?: UpdateTaskInput;
    currentUserId?: number;
    heightWithMargin: number;
}

export class TaskDetailModalComponent extends Component<Props, State> {
    private readonly graphSource: GraphSource;
    private readonly modalRef = createRef<ModalUI>();
    private readonly markdownEditorRef = createRef<MarkdownEditorUI>();
    private readonly threadDivRef = createRef<HTMLDivElement>();
    private readonly dueAtDatePicker = createRef<DatePickerUI>();

    constructor(props: Props) {
        super(props);
        this.graphSource = props.deps.graphSource;
        this.state = {
            heightWithMargin: 0,
        };
    }

    public render(): ReactNode {
        const dueAt = this.state.updatedTask?.dueAt
            ? new Date(this.state.updatedTask.dueAt)
            : undefined;
        return (
            <ModalUI ref={this.modalRef} onClose={this.props.onClose}>
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
                            <div
                                className={`${styles.Action} ${
                                    styles.AssignOwner
                                } ${classNames({
                                    [styles.Active]:
                                        this.props.taskSelectingOwner ===
                                        this.state.task.id,
                                })}`}
                                onClick={this.onAssignOwnerClick}
                            >
                                {this.state.task?.owner ? (
                                    <Fragment>
                                        <UserProfileUI
                                            user={this.state.task.owner}
                                        />
                                        <div className={styles.TaskOwnerName}>
                                            {`${FormatService.getShortName(
                                                this.state.task.owner.firstName,
                                                this.state.task.owner.lastName,
                                            )}`}
                                        </div>
                                    </Fragment>
                                ) : (
                                    <MaterialIconUI>face</MaterialIconUI>
                                )}
                            </div>
                            <div className={styles.SaveAction}>
                                <div
                                    className={`${styles.Button}`}
                                    onClick={this.onSaveButtonClick}
                                >
                                    Save
                                </div>
                            </div>
                        </div>
                        <div className={styles.TaskDetailSection}>
                            <div className={styles.TaskDetailTop}>
                                <div className={styles.LeftSection}>
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
                                <div className={styles.RightSection}>
                                    <div className={styles.Attributes}>
                                        <div className={styles.Row}>
                                            <DatePickerUI
                                                ref={this.dueAtDatePicker}
                                                label={'Due at'}
                                                value={dueAt}
                                            />
                                        </div>
                                        {/*<div*/}
                                        {/*    className={`${styles.Row} ${styles.Effort}`}*/}
                                        {/*>*/}
                                        {/*<NamedValueUI*/}
                                        {/*    name={'Effort'}*/}
                                        {/*    value={`${*/}
                                        {/*        this.state.task.effort ||*/}
                                        {/*        'Unknown'*/}
                                        {/*    }`}*/}
                                        {/*/>*/}
                                        {/*</div>*/}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.Context}>
                                <MarkdownEditorUI
                                    label={'Context'}
                                    content={this.state.updatedTask.context}
                                    ref={this.markdownEditorRef}
                                />
                            </div>
                        </div>
                        <div className={styles.CommentsSection}>
                            <div className={styles.Title}>
                                Comments&nbsp;(
                                {this.state.task.comments.messages.length})
                            </div>
                            <div
                                ref={this.threadDivRef}
                                className={styles.Thread}
                            >
                                <ThreadUI
                                    messages={this.state.task.comments.messages}
                                    editorUserId={this.state.currentUserId!}
                                    postButtonLabel={'Comment'}
                                    onPostMessage={this.onPostComment}
                                    onDeleteMessage={this.onDeleteMessage}
                                    onUpdateMessage={this.onUpdateMessage}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </ModalUI>
        );
    }

    public componentDidMount() {
        window.addEventListener('resize', this.onBodyResize);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.onBodyResize);
    }

    public async open(taskId: number) {
        const syncPromise = this.graphSource.syncTask(taskId);
        this.setState(
            {
                task: undefined,
            },
            async () => {
                this.modalRef.current?.open();
                await syncPromise;
                const task = this.graphSource.task(taskId);
                this.setState({
                    task,
                    updatedTask: {
                        goal: task.goal,
                        context: task.context,
                        ownerUserId: task.owner?.id,
                        owningTeamId: task.owningTeam.id,
                        effort: task.effort,
                        dueAt: task.dateAt,
                    },
                    currentUserId: this.graphSource.currentUser()?.id,
                });
                this.adjustSize();
                this.scrollToCommentsBottom();
            },
        );
    }

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };

    private onBodyResize = () => {
        this.adjustSize();
    };

    private adjustSize() {
        this.setState({
            heightWithMargin: document.body.clientHeight,
        });
    }

    private onSaveButtonClick = async () => {
        if (this.state.task) {
            const dueAt = this.dueAtDatePicker.current?.value || undefined;
            const task = this.state.task!;
            await this.graphSource.updateTask(task.id, {
                goal: this.state.updatedTask!.goal,
                context: this.markdownEditorRef.current?.content,
                ownerUserId: task.owner?.id,
                owningTeamId: this.graphSource.currentTeam()!.id,
                dueAt: dueAt,
            });
            await this.props.deps.feedbackPubSub.publish({
                type: 'TaskUpdated',
                task: this.state.task,
            });
        }
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
        await this.graphSource.createMessage(this.state.task!.comments.id, {
            body,
        });
        this.scrollToCommentsBottom();
    };

    private onDeleteMessage = async (messageId: number) => {
        await this.props.deps.graphSource.deleteMessage(messageId);
    };

    private onUpdateMessage = async (messageId: number, body: string) => {
        await this.props.deps.graphSource.updateMessage(messageId, {
            body,
        });
    };

    private scrollToCommentsBottom() {
        const threadDivEl = this.threadDivRef.current;
        threadDivEl?.scrollTo(0, threadDivEl?.scrollHeight);
    }

    private onAssignOwnerClick = (event: MouseEvent<HTMLDivElement>): void => {
        const element = event.currentTarget as HTMLDivElement;
        this.props.onShowPotentialTaskOwners?.call(
            null,
            this.state.task!,
            (): Rect => {
                return element.getBoundingClientRect();
            },
        );
    };
}
