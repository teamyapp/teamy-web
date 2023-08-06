import { Component } from 'react';

import * as csp from '@lib/csp/csp';
import { RouteUpdate, Router } from '@lib/router/router';

import { Deps } from '@core/dep/deps';
import {
    getTag,
    marketplaceDiscoverRoutePattern,
    marketplaceFilterRoutePattern,
    marketplaceInstalledRoutePattern,
    marketplaceManagedRoutePattern,
} from '@core/routing/routes';

import styles from './FilterTab.component.module.scss';
import googleCalendarIconImg from './assets/calendar.png';
import excelIconImg from './assets/excel.png';
import figmaIconImg from './assets/figma.png';
import githubIconImg from './assets/github.png';
import gmailIconImg from './assets/gmail.png';
import instagramIconImg from './assets/instagram.png';
import miro from './assets/miro.png';
import notionIconImg from './assets/notion.png';
import onePasswordIconImg from './assets/onePassword.png';
import powerpointIconImg from './assets/powerPoint.png';
import salesforce from './assets/salesforce.png';
import slackIconImg from './assets/slack.png';
import teamsIconImg from './assets/teams.png';
import googleTranslateIconImg from './assets/translate.png';
import wechatIconImg from './assets/wechat.png';
import wordIconImg from './assets/word.png';
import zoomIconImg from './assets/zoom.png';
import { formatCount, formatPrice } from './format';

interface Item {
    id: number;
    iconUrl: string;
    name: string;
    installations: number;
    price: number;
    isInstalled?: boolean;
}

const items: Item[] = [
    {
        id: 1,
        iconUrl: githubIconImg,
        name: 'Github',
        installations: 1_400,
        price: 0,
        isInstalled: true,
    },
    {
        id: 2,
        iconUrl: zoomIconImg,
        name: 'Zoom',
        installations: 1_200,
        price: 0,
    },
    {
        id: 3,
        iconUrl: slackIconImg,
        name: 'Slack',
        installations: 1_000_000,
        price: 0,
    },
    {
        id: 4,
        iconUrl: teamsIconImg,
        name: 'Teams',
        installations: 1_300_000,
        price: 0,
    },
    {
        id: 5,
        iconUrl: figmaIconImg,
        name: 'Figma',
        installations: 50_000,
        price: 0,
    },
    {
        id: 6,
        iconUrl: notionIconImg,
        name: 'Notion',
        installations: 100_000,
        price: 0,
    },
    {
        id: 7,
        iconUrl: miro,
        name: 'Miro',
        installations: 1_000_000,
        price: 0,
    },
    {
        id: 8,
        iconUrl: googleCalendarIconImg,
        name: 'Google Calender',
        installations: 1_400,
        price: 0,
    },
    {
        id: 9,
        iconUrl: gmailIconImg,
        name: 'Gmail',
        installations: 2_000_000,
        price: 0,
    },
    {
        id: 10,
        iconUrl: wordIconImg,
        name: 'Word',
        installations: 1_500_000,
        price: 1.99,
    },
    {
        id: 11,
        iconUrl: powerpointIconImg,
        name: 'Powerpoint',
        installations: 1_400,
        price: 1.99,
    },
    {
        id: 12,
        iconUrl: excelIconImg,
        name: 'Excel',
        installations: 2_000_000,
        price: 1.99,
    },
    {
        id: 13,
        iconUrl: googleTranslateIconImg,
        name: 'Google Translate',
        installations: 12_000,
        price: 0,
    },
    {
        id: 14,
        iconUrl: salesforce,
        name: 'Salesforce',
        installations: 2_000_000,
        price: 4.99,
    },
    {
        id: 15,
        iconUrl: onePasswordIconImg,
        name: '1Password',
        installations: 10_000,
        price: 2.99,
    },
    {
        id: 16,
        iconUrl: wechatIconImg,
        name: 'WeChat',
        installations: 1_400_000,
        price: 0,
    },
    {
        id: 17,
        iconUrl: instagramIconImg,
        name: 'Instagram',
        installations: 1_600_000,
        price: 0,
    },
];

const tagToItemIds: Record<string, number[]> = {
    'developer-tools': [1],
    automation: [],
    communication: [2, 3, 4, 9, 16],
    design: [5, 7],
    sales: [14, 17],
    productivity: [8, 10, 11, 12],
};

interface Props {
    deps: Deps;
}

interface State {
    tag?: string;
}

export class FilterTabComponent extends Component<Props, State> {
    private readonly router: Router;
    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.state = {};
    }

    componentDidMount() {
        this.routeChangeChan = this.router.subscribeRouteChange();
        (async () => {
            while (true) {
                const routeUpdate = await this.routeChangeChan!.pop();
                if (routeUpdate === undefined) {
                    return;
                }

                if (
                    routeUpdate.routePattern.startsWith(
                        marketplaceFilterRoutePattern,
                    )
                ) {
                    this.setState({
                        tag: getTag(routeUpdate.params),
                    });
                }
            }
        })().then();
    }

    render() {
        return (
            <div className={styles.ItemList}>
                {filterItemsByTag(items, this.state.tag).map((item) => (
                    <div key={item.id} className={styles.InlineItem}>
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
                            {item.isInstalled && (
                                <>
                                    <div
                                        className={`${styles.Button} ${styles.Setting}`}
                                    >
                                        Setting
                                    </div>
                                    <div
                                        className={`${styles.Button}  ${styles.Remove}`}
                                    >
                                        Remove
                                    </div>
                                </>
                            )}
                            {!item.isInstalled && (
                                <>
                                    <div className={styles.Price}>
                                        {formatPrice(item.price)}
                                    </div>
                                    <div className={`${styles.Button}`}>
                                        Install
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

function filterItemsByTag(items: Item[], tag: string | undefined) {
    if (!tag) {
        return items;
    }

    return items.filter((item) => tagToItemIds[tag].includes(item.id));
}
