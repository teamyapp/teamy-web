import * as csp from '@creatcodebuild/csp';
import React, { Component, createRef, ReactElement } from 'react';
import { Deps } from '../../../deps';
import * as events from '../../../entity/events';
import { Message } from '../../../entity/message';
import { Task } from '../../../entity/task';
import { ButtonUI } from '../../../ui/view/Button';
import { DatePickerUI } from '../../../ui/view/DatePicker';
import { MarkdownEditorUI } from '../../../ui/view/MarkdownEditor';
import { MaterialIconUI } from '../../../ui/view/MaterialIcon';
import { ModalUI } from '../../../ui/view/Modal';
// import { NamedValueUI } from '../../../ui/view/NamedValue';
import { TextFieldUI } from '../../../ui/view/TextField';
import { ThreadUI } from '../Thread';

import styles from './TaskModal.component.module.scss';

const verticalMargin = 40;

interface IProps {
    deps: Deps;
    mutationChan: csp.Channel<events.MutationEvent>;
}

interface IState {
    task?: Task;
    comments: Message[];
    meUserId?: number;
    heightWithMargin: number;
}

export class TaskModalComponent extends Component<IProps, IState> {
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
                        <div className={styles.TaskDetail}>
                            <div className={styles.LeftSection}>
                                <TextFieldUI
                                    value={this.state.task.goal}
                                    label={'Goal'}
                                    showLengthCounter={true}
                                    maxLength={70}
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
                                    <div
                                        className={`${styles.Row} ${styles.Effort}`}
                                    >
                                        {/*<NamedValueUI*/}
                                        {/*    name={'Effort'}*/}
                                        {/*    value={`${*/}
                                        {/*        this.state.task.effort ||*/}
                                        {/*        'Unknown'*/}
                                        {/*    }`}*/}
                                        {/*/>*/}
                                    </div>
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
                        )
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

    public async open(task: Task) {
        await this.refresh(task);
        this.adjustSize();
        this.modalRef.current?.open();
        this.scrollToCommentsBottom();
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
            const task = Object.assign({}, this.state.task, {
                context: this.markdownEditorRef.current?.state.content,
            });
            await this.props.mutationChan.put({
                type: 'TaskUpdate',
                taskId: this.state.task?.id,
                goal: this.state.task.goal,
                context: task.context || '',
            });
            await this.props.deps.taskService.updateTask(task);
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
        await this.refresh(this.state.task!);
        this.scrollToCommentsBottom();
    };

    private onDeleteComment = async (commentId: number) => {
        await this.props.deps.commentService.deleteComment(commentId);
        await this.refresh(this.state.task!);
    };

    private onUpdateComment = async (commentId: number, content: string) => {
        await this.props.deps.commentService.updateComment(commentId, content);
        await this.refresh(this.state.task!);
    };

    private scrollToCommentsBottom() {
        const threadDivEl = this.threadDivRef.current;
        threadDivEl?.scrollTo(0, threadDivEl?.scrollHeight);
    }

    private async refresh(task: Task) {
        const mePromise = this.props.deps.userService.fetchMe('cache-first');
        const commentsPromise =
            this.props.deps.commentService.fetchTaskComments(
                task.id,
                'network-only',
            );
        const [me, comments] = await Promise.all([mePromise, commentsPromise]);
        this.setState({
            task: task,
            meUserId: me.id,
            comments: comments,
        });
    }
}
