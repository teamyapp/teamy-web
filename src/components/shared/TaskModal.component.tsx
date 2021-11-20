import React, { Component, createRef, ReactElement } from 'react';
import Task from '../../entity/Task';
import { DatePickerComponent } from '../ui/DatePicker.component';
import MarkdownEditorComponent from '../ui/MarkdownEditor.component';
import MaterialIconComponent from '../ui/MaterialIcon.component';
import ModalComponent from '../ui/Modal.component';
import NamedValueComponent from '../ui/NamedValue.component';
import TextFieldComponent from '../ui/TextField.component';

import styles from './TaskModal.component.module.scss';

interface IState {
    task?: Task;
}

export default class TaskModalComponent extends Component<any, IState> {
    private modalRef = createRef<ModalComponent>();

    constructor(props: any) {
        super(props);
        this.state = {};
    }

    public render(): ReactElement {
        return (
            <ModalComponent ref={this.modalRef}>
                <div className={styles.Header}>
                    Task #{this.state.task?.id}
                    <div
                        className={styles.CloseButton}
                        onClick={this.onCloseButtonClick}
                    >
                        <MaterialIconComponent>cancel</MaterialIconComponent>
                    </div>
                </div>
                <div>
                    {this.state.task && (
                        <div className={styles.TaskDetail}>
                            <div className={styles.LeftSection}>
                                <TextFieldComponent
                                    value={this.state.task.goal}
                                    label={'Goal'}
                                    showLengthCounter={true}
                                    maxLength={70}
                                    onChange={this.onTextFieldChangeHandler(
                                        'goal',
                                    )}
                                />
                                <div className={styles.Context}>
                                    <MarkdownEditorComponent
                                        label={'Context'}
                                        content={this.state.task.context}
                                    />
                                </div>
                            </div>
                            <div className={styles.RightSection}>
                                <div>
                                    <div className={`${styles.Row}`}>
                                        <DatePickerComponent label={'Due at'} />
                                    </div>
                                    <div
                                        className={`${styles.Row} ${styles.Effort}`}
                                    >
                                        <NamedValueComponent
                                            name={'Effort'}
                                            value={`${
                                                this.state.task.effort ||
                                                'Unknown'
                                            }`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ModalComponent>
        );
    }

    public open(task: Task) {
        this.setState({
            task: task,
        });
        this.modalRef.current?.open();
    }

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
