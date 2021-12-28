import { ComponentStory } from '@storybook/react';
import { Message } from '../../entity/message';
import { ThreadUI } from './Thread';

import styles from './Thread.stories.module.scss';

const initialMessages: Message[] = [
    {
        id: 1,
        author: {
            id: 1,
            firstName: 'Albert',
            lastName: 'Wang',
            profileUrl: 'profiles/boy1.png',
        },
        content: `Originally, we design task to be able to belong to multiple teams because at that time, we treat Kanban as a place and a task can be put to many places`,
        createdAt: new Date(2020, 11, 20, 9, 52, 0),
    },
    {
        id: 4,
        author: {
            id: 3,
            firstName: 'Girl',
            lastName: 'Cool',
            profileUrl: 'profiles/girl1.png',
        },
        content: `We may want to try something else`,
        createdAt: new Date(2021, 11, 19, 0, 52, 0),
    },
    {
        id: 2,
        author: {
            id: 2,
            firstName: 'Harry',
            lastName: 'Liu',
            profileUrl: 'profiles/boy2.png',
        },
        content: `Or even a person in the future`,
        createdAt: new Date(2021, 11, 20, 9, 52, 1),
    },
    {
        id: 3,
        author: {
            id: 1,
            firstName: 'Albert',
            lastName: 'Wang',
            profileUrl: 'profiles/boy1.png',
        },
        content: `But now, this model of thinking is problematic`,
        createdAt: new Date(2021, 11, 25, 9, 53, 0),
    },
    {
        id: 4,
        author: {
            id: 3,
            firstName: 'Girl',
            lastName: 'Cool',
            profileUrl: 'profiles/girl1.png',
        },
        content: `I agree`,
        createdAt: new Date(2021, 11, 26, 9, 52, 0),
    },
];

export default {
    component: ThreadUI,
    argTypes: {
        editorUserId: {
            control: 'number',
        },
        onPostMessage: {
            action: 'onPostMessage',
        },
        onEditMessage: {
            action: 'onEditMessage',
        },
        onDeleteMessage: {
            action: 'onDeleteMessage',
        },
    },
};

const Template: ComponentStory<typeof ThreadUI> = ({
    messages,
    editorUserId,
    onPostMessage,
    onUpdateMessage,
    onDeleteMessage,
}) => {
    return (
        <div className={styles.Box}>
            <ThreadUI
                messages={messages}
                editorUserId={editorUserId}
                onPostMessage={onPostMessage}
                onUpdateMessage={onUpdateMessage}
                onDeleteMessage={onDeleteMessage}
            />
        </div>
    );
};

export const Primary = Template.bind({});
Primary.args = {
    editorUserId: 2,
    messages: initialMessages,
};
