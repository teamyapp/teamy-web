import React, { Component, createRef } from 'react';
import { Message } from '../../entity/message';
import { FormatService } from '../../service/format.service';
import { ButtonUI } from '../../ui/view/Button';
import { MaterialIconUI } from '../../ui/view/MaterialIcon';
import { TextAreaUI } from '../../ui/view/TextArea';
import styles from './Thread.module.scss';
import { UserProfileUI } from './UserProfile';

interface IProps {
    messages: Message[];
    editorUserId: number;
    onPostMessage?: (message: string) => void;
    onEditMessage?: (messageId: number, message: string) => void;
    onDeleteMessage?: (messageId: number) => void;
}

interface IState {
    editingMessageId: number;
    editingMessageContent?: string;
}

export class ThreadUI extends Component<IProps, IState> {
    private readonly textAreaRef = createRef<TextAreaUI>();

    constructor(props: IProps) {
        super(props);
        this.state = {
            editingMessageId: -1,
        };
    }

    public render() {
        return (
            <div className={styles.Thread}>
                {this.props.messages.map(this.renderMessage)}
                <div className={styles.Input}>
                    <div className={styles.TextArea}>
                        <TextAreaUI
                            ref={this.textAreaRef}
                            placeholder={'Here is what I think...'}
                        />
                    </div>
                    <div className={styles.Actions}>
                        <div className={styles.Save}>
                            <ButtonUI
                                label={'Post'}
                                onClick={this.onPostMessageClick}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private renderMessage = (message: Message, index: number) => {
        const { author } = message;
        return (
            <div key={index} className={styles.Message}>
                <div className={styles.MessageCenter}>
                    <div className={styles.LeftSection}>
                        <UserProfileUI user={author} />
                    </div>
                    <div className={styles.RightSection}>
                        <div className={styles.RightTopRow}>
                            <div className={styles.AuthorName}>
                                {FormatService.getShortName(
                                    author.firstName,
                                    author.lastName,
                                )}
                            </div>
                            <div className={styles.MessagePostedAt}>
                                {FormatService.timeFromNow(message.createdAt)}
                            </div>
                            <div className={styles.Spacer} />
                            <div className={styles.MessageActions}>
                                {this.props.editorUserId === author.id && (
                                    <div
                                        className={`${styles.MessageAction} ${styles.MessageEditAction}`}
                                        onClick={this.onEditMessageClick(
                                            message,
                                        )}
                                    >
                                        <MaterialIconUI>
                                            edit_note
                                        </MaterialIconUI>
                                    </div>
                                )}
                                {this.props.editorUserId === author.id && (
                                    <div
                                        className={`${styles.MessageAction} ${styles.MessageDeleteAction}`}
                                        onClick={this.onDeleteMessageClick(
                                            message.id,
                                        )}
                                    >
                                        <MaterialIconUI>clear</MaterialIconUI>
                                    </div>
                                )}
                            </div>
                        </div>
                        {this.state.editingMessageId === message.id ? (
                            <div className={styles.TextArea}>
                                <TextAreaUI
                                    content={message.content}
                                    onChange={this.onEditingMessageChange}
                                    onBlur={this.onEditingMessageBlur}
                                />
                            </div>
                        ) : (
                            <div className={styles.MessageContent}>
                                {message.content}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    private onPostMessageClick = () => {
        this.props.onPostMessage?.call(
            null,
            this.textAreaRef.current?.content || '',
        );
        if (this.textAreaRef.current) {
            this.textAreaRef.current.content = '';
        }
    };

    private onEditMessageClick = (message: Message): (() => void) => {
        return () => {
            this.setState({
                editingMessageId: message.id,
                editingMessageContent: message.content,
            });
        };
    };

    private onDeleteMessageClick = (messageId: number): (() => void) => {
        return () => {
            this.props.onDeleteMessage?.call(null, messageId);
        };
    };

    private onEditingMessageChange = (messageContent: string) => {
        this.setState({
            editingMessageContent: messageContent,
        });
    };

    private onEditingMessageBlur = () => {
        this.props.onEditMessage?.call(
            null,
            this.state.editingMessageId,
            this.state.editingMessageContent || '',
        );
        this.setState({
            editingMessageId: -1,
        });
    };
}
