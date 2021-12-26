import React, { Component } from 'react';
import { Message } from '../../entity/message';
import { FormatService } from '../../service/format.service';
import { ButtonUI } from '../../ui/view/Button';
import { TextAreaUI } from '../../ui/view/TextArea';
import { UserProfileUI } from './UserProfile';
import styles from './Thread.module.scss';

interface IProps {
    messages: Message[];
}

export class ThreadUI extends Component<IProps> {
    public render() {
        return (
            <div className={styles.Thread}>
                {this.props.messages.map(this.renderMessage)}
                <div className={styles.Input}>
                    <div className={styles.TextArea}>
                        <TextAreaUI placeholder={'Here is what I think...'} />
                    </div>
                    <div className={styles.Actions}>
                        <div className={styles.Save}>
                            <ButtonUI label={'Send'} />
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
                <div className={styles.LeftSection}>
                    <UserProfileUI user={author} />
                </div>
                <div className={styles.RightSection}>
                    <div>
                        <span className={styles.AuthorName}>
                            {FormatService.getShortName(
                                author.firstName,
                                author.lastName,
                            )}
                        </span>
                        <span className={styles.MessagePostedAt}>
                            {FormatService.timeFromNow(message.createdAt)}
                        </span>
                    </div>
                    <div className={styles.MessageContent}>
                        {message.content}
                    </div>
                </div>
            </div>
        );
    };
}
