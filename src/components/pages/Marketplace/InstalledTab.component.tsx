import { Component, createRef } from 'react';

import { Deps } from '@core/dep/deps';

import styles from './InstalledTab.component.module.scss';
import { AppSettingModalComponent } from './Modals/AppSettingModal.component';
import githubIconImg from './assets/github.png';
import slackIconImg from './assets/slack.png';
import { formatCount } from './format';

interface Item {
    id: number;
    iconUrl: string;
    name: string;
    installations: number;
}

const items: Item[] = [
    {
        id: 1,
        iconUrl: githubIconImg,
        name: 'Github',
        installations: 1_400,
    },
    {
        id: 2,
        iconUrl: slackIconImg,
        name: 'Slack',
        installations: 1_300_000,
    },
];

interface Props {
    deps: Deps;
}

interface State {}

export class InstalledTabComponent extends Component<Props, State> {
    private readonly appSettingModalRef = createRef<AppSettingModalComponent>();

    render() {
        return (
            <>
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
                                <div className={styles.Installations}>
                                    {formatCount(item.installations)} installed
                                </div>
                            </div>
                            <div className={styles.RightSection}>
                                <div
                                    className={`${styles.Button} ${styles.Setting}`}
                                    onClick={this.onAppSettingButtonClickHandler(
                                        item.id,
                                    )}
                                >
                                    Setting
                                </div>
                                <div
                                    className={`${styles.Button}  ${styles.Remove}`}
                                >
                                    Remove
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <AppSettingModalComponent ref={this.appSettingModalRef} />
            </>
        );
    }

    private onAppSettingButtonClickHandler = (appId: number) => {
        return () => {
            this.appSettingModalRef.current?.open(appId);
        };
    };
}
