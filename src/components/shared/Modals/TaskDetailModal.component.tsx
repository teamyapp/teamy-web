import classNames from 'classnames';
import React, { Component, MouseEvent, ReactElement, createRef } from 'react';

import { ButtonUI } from '@lib/ui/Button';
import { DatePickerUI } from '@lib/ui/DatePicker';
import { MarkdownEditorUI } from '@lib/ui/MarkdownEditor';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { ModalUI } from '@lib/ui/Modal';

import { TextFieldUI } from '@lib/ui/TextField';

import { Deps } from '@core/dep/deps';
import { Message } from '@core/entity/message';
import { IBoundingBoxFinder, Rect } from '@core/entity/position';
import { Task } from '@core/entity/task';
import { goalLengthLimit } from '@core/service/task.service';

import { ThreadUI } from '../Thread';
import { UserProfileUI } from '../UserProfile';
import styles from './TaskDetailModal.component.module.scss';

const verticalMargin = 40;

interface IProps {
    deps: Deps;
    taskSelectingOwner?: number | string;
    onShowPotentialTaskOwners?: (
        task: Task,
        findAlignTargetBoundBox: IBoundingBoxFinder,
    ) => void;
}

interface IState {
    task?: Task;
    comments: Message[];
    meUserId?: number;
    heightWithMargin: number;
}

export class TaskDetailModalComponent extends Component<IProps, IState> {
    private readonly modalRef = createRef<ModalUI>();
    private readonly markdownEditorRef = createRef<MarkdownEditorUI>();
    private readonly threadDivRef = createRef<HTMLDivElement>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            comments: [],
            heightWithMargin: 0,
        };
    }

    public render(): ReactElement {
        return (
            <ModalUI ref={this.modalRef}>
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
                                    <UserProfileUI
                                        user={this.state.task.owner}
                                    />
                                ) : (
                                    <MaterialIconUI>face</MaterialIconUI>
                                )}
                            </div>
                        </div>
                        <div className={styles.TaskDetailSection}>
                            <div className={styles.LeftSection}>
                                <TextFieldUI
                                    value={this.state.task.goal}
                                    label={'Goal'}
                                    showLengthCounter={true}
                                    maxLength={goalLengthLimit}
                                    onChange={this.onTextFieldChangeHandler(
                                        'goal',
                                    )}
                                />
                                <div className={styles.Context}>
                                    <MarkdownEditorUI
                                        label={'Context'}
                                        content={this.state.task.context}
                                        ref={this.markdownEditorRef}
                                    />
                                </div>
                            </div>
                            <div className={styles.RightSection}>
                                <div className={styles.Attributes}>
                                    <div className={styles.Row}>
                                        <DatePickerUI label={'Due at'} />
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
                                <div className={styles.Actions}>
                                    <div className={styles.SaveAction}>
                                        <ButtonUI
                                            label={'Save'}
                                            onClick={this.onSaveButtonClick}
                                        />
                                    </div>
                                </div>
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
                                    onDeleteMessage={this.onDeleteComment}
                                    onUpdateMessage={this.onUpdateComment}
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

    public async open(taskId: number | string) {
        await this.refreshWithTaskId(taskId);
        this.adjustSize();
        this.modalRef.current?.open();
        this.scrollToCommentsBottom();
    }

    public async refresh() {
        if (this.state.task) {
            await this.refreshWithTaskId(this.state.task.id);
        }
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
            await this.props.deps.localStore.mutate({
                type: 'UpdateTask',
                task: Object.assign<any, Task, Partial<Task>>(
                    {},
                    this.state.task,
                    {
                        context: this.markdownEditorRef.current?.content,
                    },
                ),
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

    private onPostComment = async (content: string) => {
        await this.props.deps.commentService.createComment(
            this.state.task?.id || -1,
            content,
        );
        await this.refresh();
        this.scrollToCommentsBottom();
    };

    private onDeleteComment = async (commentId: number) => {
        await this.props.deps.commentService.deleteComment(commentId);
        await this.refresh();
    };

    private onUpdateComment = async (commentId: number, content: string) => {
        await this.props.deps.commentService.updateComment(commentId, content);
        await this.refresh();
    };

    private scrollToCommentsBottom() {
        const threadDivEl = this.threadDivRef.current;
        threadDivEl?.scrollTo(0, threadDivEl?.scrollHeight);
    }

    private async refreshWithTaskId(taskId: number | string) {
        const mePromise = this.props.deps.userService.fetchMe('cache-first');
        const taskPromise = this.props.deps.taskService.fetchTask(
            taskId,
            'network-only',
        );
        const commentsPromise =
            this.props.deps.commentService.fetchTaskComments(
                taskId,
                'network-only',
            );
        const [me, task, comments] = await Promise.all([
            mePromise,
            taskPromise,
            commentsPromise,
        ]);
        this.setState({
            task: task,
            meUserId: me.id,
            comments: comments,
        });
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
