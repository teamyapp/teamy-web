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
import { Message } from '@core/entity/message';
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
    comments: Message[];
    meUserId?: number;
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
            comments: [],
            heightWithMargin: 0,
        };
    }

    public render(): ReactNode {
        const dueAt = this.state.task?.dueAt
            ? new Date(this.state.task.dueAt)
            : undefined;
        return (
            <ModalUI ref={this.modalRef} onClose={this.props.onClose}>
                {this.state.task && (
                    <div
                        className={styles.ModalContent}
                        style={{
                            height:
                                this.state.heightWithMargin -
                                2 * verticalMargin,
                        }}
                    >
                        <div className={styles.Header}>
                            Task #{this.state.task?.id}
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
                                        value={this.state.task.goal}
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
                                    content={this.state.task.context}
                                    ref={this.markdownEditorRef}
                                />
                            </div>
                        </div>
                        <div className={styles.CommentsSection}>
                            <div className={styles.Title}>
                                Comments&nbsp;({this.state.comments.length})
                            </div>
                            <div
                                ref={this.threadDivRef}
                                className={styles.Thread}
                            >
                                <ThreadUI
                                    messages={this.state.comments}
                                    editorUserId={this.state.meUserId || -1}
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
        // await this.refreshWithTaskId(taskId, 'cache-first');
        this.adjustSize();
        this.modalRef.current?.open();
        this.scrollToCommentsBottom();
    }

    // public async refresh(policy: FetchPolicy) {
    //     if (this.state.task) {
    //         await this.refreshWithTaskId(this.state.task.id, policy);
    //     }
    // }

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
            const task = this.state.task;
            await this.graphSource.updateTask(this.state.task.id, {
                goal: task.goal,
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
                task: Object.assign({}, this.state.task, {
                    [taskProp]: newValue,
                }),
            });
        };
    }

    // todo: use mutation event
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

    // private async refreshWithTaskId(
    //     taskId: number,
    //     policy: FetchPolicy,
    // ) {
    //     const mePromise = this.props.deps.userService.fetchMe(policy);
    //     const taskPromise = this.props.deps.taskService.fetchTask(
    //         taskId,
    //         policy,
    //     );
    //     const commentsPromise =
    //         this.props.deps.commentService.fetchTaskComments(taskId, policy);
    //     const [me, task, comments] = await Promise.all([
    //         mePromise,
    //         taskPromise,
    //         commentsPromise,
    //     ]);
    //     this.setState({
    //         task: task,
    //         meUserId: me.id,
    //         comments: comments,
    //     });
    // }

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
