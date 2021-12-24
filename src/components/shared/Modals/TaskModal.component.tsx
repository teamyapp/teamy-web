import React, { Component, createRef, ReactElement } from 'react';
import { Deps } from '../../../deps';
import Task from '../../../entity/Task';
import { Button } from '../../../ui/view/Button';
import { DatePickerUI } from '../../../ui/view/DatePicker';
import { MarkdownEditorUI } from '../../../ui/view/MarkdownEditor';
import { MaterialIconUI } from '../../../ui/view/MaterialIcon';
import { ModalUI } from '../../../ui/view/Modal';
import { NamedValueUI } from '../../../ui/view/NamedValue';
import { TextFieldUI } from '../../../ui/view/TextField';
import * as csp from '@creatcodebuild/csp';

import styles from './TaskModal.component.module.scss';
import * as events from '../../../entity/events';

interface IProps {
    deps: Deps;
    mutChan: csp.Channel<events.MutationEvent>;
}

interface IState {
    task?: Task;
}

export class TaskModalComponent extends Component<any, IState> {
    private modalRef = createRef<ModalUI>();
    private markdownEditorRef = createRef<MarkdownEditorUI>();

    constructor(props: IProps) {
        super(props);
        this.state = {};
    }

    public render(): ReactElement {
        return (
            <ModalUI ref={this.modalRef}>
                <div className={styles.Header}>
                    Task #{this.state.task?.id}
                    <div
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconUI>cancel</MaterialIconUI>
                    </div>
                </div>
                <div>
                    {this.state.task && (
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
                                        <NamedValueUI
                                            name={'Effort'}
                                            value={`${
                                                this.state.task.effort ||
                                                'Unknown'
                                            }`}
                                        />
                                    </div>
                                </div>
                                <div className={styles.Actions}>
                                    <div className={styles.SaveAction}>
                                        <Button
                                            label={'Save'}
                                            onClick={this.onSaveButtonClick}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModalUI>
        );
    }

    public open(task: Task) {
        this.setState({
            task: task,
        });
        this.modalRef.current?.open();
    }

    private onSaveButtonClick = async () => {
        if (this.state.task) {
            const task = Object.assign({}, this.state.task, {
              context: this.markdownEditorRef.current?.state.content
            });
            task.context = this.markdownEditorRef.current?.state.content;
            this.props.mutChan.put({
                type: 'TaskUpdate',
                id: this.state.task?.id,
                goal: this.state.task.goal,
                context: this.markdownEditorRef.current?.state.content,
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

    private onCloseButtonClick = () => {
        this.modalRef.current?.close();
    };
}
