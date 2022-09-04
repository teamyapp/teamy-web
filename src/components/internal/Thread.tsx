import React, { Component, createRef } from 'react';

import { timeFromNow } from '@lib/data/format';
import { ButtonUI } from '@lib/ui/Button';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';
import { SpacerUI } from '@lib/ui/Spacer';
import { TextAreaUI } from '@lib/ui/TextArea';

import { Message } from '@core/entity/message';

import styles from './Thread.module.scss';
import { UserProfileUI } from './UserProfile';
import { getUserShortName } from './format';

interface Props {
    messages: Message[];
    editorUserId: number;
    postButtonLabel?: string;
    onPostMessage?: (message: string) => void;
    onUpdateMessage?: (messageId: number, message: string) => Promise<void>;
    onDeleteMessage?: (messageId: number) => void;
}

interface State {
    editingMessageId: number;
    editingMessageBody?: string;
}

export class ThreadUI extends Component<Props, State> {
    private readonly textAreaRef = createRef<TextAreaUI>();

    constructor(props: Props) {
        super(props);
        this.state = {
            editingMessageId: -1,
        };
    }

    public render() {
        return (
            <div className={styles.Thread}>
                {this.props.messages
                    .sort(
                        (comment1: any, comment2: any) =>
                            comment1.createdAt - comment2.createdAt,
                    )
                    .map(this.renderMessage)}
                <div className={styles.Input}>
                    <div className={styles.TextArea}>
                        <TextAreaUI
                            ref={this.textAreaRef}
                            placeholder={'Here is what I think...'}
                        />
                    </div>
                    <div className={styles.Actions}>
                        <div className={styles.PostMessage}>
                            <ButtonUI
                                label={this.props.postButtonLabel || 'Post'}
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
                                {getUserShortName(
                                    author.firstName,
                                    author.lastName,
                                )}
                            </div>
                            <div className={styles.MessagePostedAt}>
                                {timeFromNow(message.createdAt)}
                            </div>
                            <SpacerUI />
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
                                    content={message.body}
                                    autoFocus={true}
                                    onChange={this.onEditingMessageChange}
                                    onBlur={this.onEditingMessageBlur}
                                />
                            </div>
                        ) : (
                            <div className={styles.MessageContent}>
                                {message.body}
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
                editingMessageBody: message.body,
            });
        };
    };

    private onDeleteMessageClick = (messageId: number): (() => void) => {
        return () => {
            this.props.onDeleteMessage?.call(null, messageId);
        };
    };

    private onEditingMessageChange = (messageBody: string) => {
        this.setState({
            editingMessageBody: messageBody,
        });
    };

    private onEditingMessageBlur = async () => {
        await this.props.onUpdateMessage?.call(
            null,
            this.state.editingMessageId,
            this.state.editingMessageBody || '',
        );
        this.setState({
            editingMessageId: -1,
        });
    };
}
