import { Component } from 'react';

import { Deps } from '@core/dep/deps';

import styles from './ManagedTab.component.module.scss';
import githubIconImg from './assets/github.png';
import slackIconImg from './assets/slack.png';
import teamsIconImg from './assets/teams.png';
import wechatIconImg from './assets/wechat.png';

interface Item {
    id: number;
    iconUrl: string;
    name: string;
}

const items: Item[] = [
    {
        id: 1,
        iconUrl: githubIconImg,
        name: 'Github',
    },
    {
        id: 2,
        iconUrl: slackIconImg,
        name: 'Slack',
    },
    {
        id: 3,
        iconUrl: teamsIconImg,
        name: 'Teams',
    },
    {
        id: 4,
        iconUrl: wechatIconImg,
        name: 'WeChat',
    },
];

interface Props {
    deps: Deps;
}

interface State {}

export class ManagedTabComponent extends Component<Props, State> {
    render() {
        return (
            <div className={styles.ItemList}>
                {items.map((item) => (
                    <div className={styles.InlineItem}>
                        <div className={styles.LeftSection}>
                            <div className={styles.Icon}>
                                <img src={item.iconUrl} />
                            </div>
                        </div>
                        <div className={styles.MiddleSection}>
                            <div className={styles.Name}>{item.name}</div>
                        </div>
                        <div className={styles.RightSection}>
                            <div
                                className={`${styles.Button} ${styles.Manage}`}
                            >
                                Manage
                            </div>
                            <div
                                className={`${styles.Button}  ${styles.Delete}`}
                            >
                                Delete
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}
