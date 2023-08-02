import { Component, ReactNode } from 'react';

import styles from './Marketplace.component.module.scss';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import githubIconImg from './assets/github.png';
import wordIconImg from './assets/word.png';
import excelIconImg from './assets/excel.png';
import powerpointIconImg from './assets/powerPoint.png';
import googleCalendarIconImg from './assets/calendar.png';
import gmailIconImg from './assets/gmail.png';
import googleTranslateIconImg from './assets/translate.png';
import zoomIconImg from './assets/zoom.png';
import slackIconImg from './assets/slack.png';
import teamsIconImg from './assets/teams.png';
import figmaIconImg from './assets/figma.png';
import notionIconImg from './assets/notion.png';
import miro from './assets/miro.png';
import salesforce from './assets/salesforce.png';
import onePasswordIconImg from './assets/onePassword.png';
import wechatIconImg from './assets/wechat.png';
import instagramIconImg from './assets/instagram.png';

import githubBannerImg from './assets/github_ads.png';

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

interface Props {
}

interface State {
}

export class MarketplaceComponent extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    public render(): ReactNode {
        return (
            <div className={styles.Marketplace}>
                <div className={styles.LeftSection}>
                    <div className={styles.SearchBox}>
                        <div className={styles.Input}>
                            <input type="text" placeholder="Search"/>
                        </div>
                        <div className={styles.Icon}>
                            <MaterialIconUI>search</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.Tabs}>
                        <div className={styles.Tab}>Installed</div>
                        <div className={styles.Tab}>Managed</div>
                    </div>
                    <div className={styles.Divider}/>
                    <div className={styles.Tabs}>
                        <div
                            className={`${styles.Tab} ${styles.Active}`}>Discover
                        </div>
                        <div className={styles.Tab}>Developer Tools</div>
                        <div className={styles.Tab}>Automation</div>
                        <div className={styles.Tab}>Communication</div>
                        <div className={styles.Tab}>Design</div>
                        <div className={styles.Tab}>Sales</div>
                        <div className={styles.Tab}>Productivity</div>
                        <div className={styles.Tab}>Workflows</div>
                    </div>
                </div>
                <div className={styles.Content}>
                    <div className={styles.BannerSection}>
                        <div className={styles.Banner}>
                            <div className={styles.Controls}>
                                <div
                                    className={`${styles.Control} ${styles.Active}`}/>
                                <div className={styles.Control}/>
                                <div className={styles.Control}/>
                                <div className={styles.Control}/>
                            </div>
                            <img src={githubBannerImg}/>
                        </div>
                    </div>
                    <div className={styles.ItemList}>
                        {
                            items.map((item) => (
                                <div className={styles.InlineItem}>
                                    <div className={styles.LeftSection}>
                                        <div className={styles.Icon}>
                                            <img src={item.iconUrl}/>
                                        </div>
                                    </div>
                                    <div className={styles.MiddleSection}>
                                        <div className={styles.Name}>
                                            {item.name}
                                        </div>
                                        <div className={styles.Installations}>
                                            {formatCount(item.installations)} installed
                                        </div>
                                    </div>
                                    <div className={styles.RightSection}>

                                        {item.isInstalled && (
                                            <>
                                                <div
                                                    className={`${styles.Button} ${styles.Setting}`}>
                                                    Setting
                                                </div>
                                                <div
                                                    className={`${styles.Button}  ${styles.Remove}`}>
                                                    Remove
                                                </div>
                                            </>)}
                                        {!item.isInstalled &&
                                            <>
                                                <div className={styles.Price}>
                                                    {formatPrice(item.price)}
                                                </div>
                                                <div
                                                    className={`${styles.Button}`}>
                                                    Install
                                                </div>
                                            </>}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>
        );
    }
}

function formatCount(count: number): string {
    if (count >= 1_000_000) {
        return `${Math.round(count / 1_000_000)}M`;
    }

    if (count >= 1_000) {
        return `${Math.round(count / 1000)}K`;
    }

    return `${count}`;
}

function formatPrice(value: number): string {
    return value === 0 ? 'Free' : `$${value}`;
}