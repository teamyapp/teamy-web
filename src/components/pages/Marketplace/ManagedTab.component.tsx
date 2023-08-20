import { Component, createRef } from 'react';

import { Deps } from '@core/dep/deps';

import styles from './ManagedTab.component.module.scss';
import { ManageAppModalComponent } from './Modals/ManageAppModal.component';
import githubIconImg from './assets/github.png';
import slackIconImg from './assets/slack.png';
import teamsIconImg from './assets/teams.png';
import wechatIconImg from './assets/wechat.png';

interface App {
    id: number;
    iconUrl: string;
    name: string;
}

const apps: App[] = [
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
    private readonly manageAppModalRef = createRef<ManageAppModalComponent>();

    render() {
        return (
            <>
                <div className={styles.ItemList}>
                    {apps.map((app) => (
                        <div className={styles.InlineItem}>
                            <div className={styles.LeftSection}>
                                <div className={styles.Icon}>
                                    <img src={app.iconUrl} />
                                </div>
                            </div>
                            <div className={styles.MiddleSection}>
                                <div className={styles.Name}>{app.name}</div>
                            </div>
                            <div className={styles.RightSection}>
                                <div
                                    className={`${styles.Button} ${styles.Manage}`}
                                    onClick={this.onManageButtonClickHandler(
                                        app.id,
                                    )}
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
                <ManageAppModalComponent ref={this.manageAppModalRef} />
            </>
        );
    }

    private onManageButtonClickHandler(itemId: number) {
        return () => {
            this.manageAppModalRef.current?.open(itemId);
        };
    }
}
