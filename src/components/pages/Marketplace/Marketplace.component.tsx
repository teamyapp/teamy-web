import classNames from 'classnames';
import { Component, ReactNode } from 'react';

import * as csp from '@lib/csp/csp';
import { Route } from '@lib/router/Route';
import { RouteUpdate, Router } from '@lib/router/router';
import { MaterialIconUI } from '@lib/ui/MaterialIcon';

import { Deps } from '@core/dep/deps';
import {
    getTag,
    marketplaceDiscoverPath,
    marketplaceDiscoverRoutePattern,
    marketplaceFilterPath,
    marketplaceFilterRoutePattern,
    marketplaceInstalledPath,
    marketplaceInstalledRoutePattern,
    marketplaceManagedPath,
    marketplaceManagedRoutePattern,
} from '@core/routing/routes';
import { LocalStore } from '@core/storage/syncer/localStore';

import { DiscoverTabComponent } from './DiscoverTab.component';
import { FilterTabComponent } from './FilterTab.component';
import { InstalledTabComponent } from './InstalledTab.component';
import { ManagedTabComponent } from './ManagedTab.component';
import styles from './Marketplace.component.module.scss';

interface Props {
    deps: Deps;
}

interface Tab<Key> {
    name: string;
    key: string;
    getRoute: (localStore: LocalStore) => string;
}

type UpperTabKey = 'managed' | 'installed';

const upperTabs: Tab<UpperTabKey>[] = [
    {
        name: 'Managed',
        key: 'managed',
        getRoute: (localStore: LocalStore) =>
            marketplaceManagedPath(localStore.getState().currTeamId!),
    },
    {
        name: 'Installed',
        key: 'installed',
        getRoute: (localStore: LocalStore) =>
            marketplaceInstalledPath(localStore.getState().currTeamId!),
    },
];

type LowerTabKey =
    | 'discover'
    | 'filter/tag=developer-tools'
    | 'filter/tag=automation'
    | 'filter/tag=communication'
    | 'filter/tag=design'
    | 'filter/tag=sales'
    | 'filter/productivity';

const lowerTabs: Tab<LowerTabKey>[] = [
    {
        name: 'Discover',
        key: 'discover',
        getRoute: (localStore: LocalStore) =>
            marketplaceDiscoverPath(localStore.getState().currTeamId!),
    },
    {
        name: 'Developer Tools',
        key: formatFilterTabKey('developer-tools'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(
                localStore.getState().currTeamId!,
                'developer-tools',
            ),
    },
    {
        name: 'Automation',
        key: formatFilterTabKey('automation'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(
                localStore.getState().currTeamId!,
                'automation',
            ),
    },
    {
        name: 'Communication',
        key: formatFilterTabKey('communication'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(
                localStore.getState().currTeamId!,
                'communication',
            ),
    },
    {
        name: 'Design',
        key: formatFilterTabKey('design'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(localStore.getState().currTeamId!, 'design'),
    },
    {
        name: 'Sales',
        key: formatFilterTabKey('sales'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(localStore.getState().currTeamId!, 'sales'),
    },
    {
        name: 'Productivity',
        key: formatFilterTabKey('productivity'),
        getRoute: (localStore: LocalStore) =>
            marketplaceFilterPath(
                localStore.getState().currTeamId!,
                'productivity',
            ),
    },
];

interface State {
    showTabViews: Record<string, boolean>;
}

export class MarketplaceComponent extends Component<Props, State> {
    private readonly router: Router;
    private readonly localStore: LocalStore;

    private routeChangeChan?: csp.PopChannel<RouteUpdate | undefined>;

    constructor(props: Props) {
        super(props);
        this.router = props.deps.router;
        this.localStore = props.deps.localStore;
        this.state = {
            showTabViews: {},
        };
    }

    public render(): ReactNode {
        return (
            <div className={styles.Marketplace}>
                <div className={styles.LeftSection}>
                    <div className={styles.SearchBox}>
                        <div className={styles.Input}>
                            <input type='text' placeholder='Search' />
                        </div>
                        <div className={styles.Icon}>
                            <MaterialIconUI>search</MaterialIconUI>
                        </div>
                    </div>
                    <div className={styles.Tabs}>
                        {upperTabs.map((tab) => (
                            <div
                                key={tab.key}
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]:
                                        this.state.showTabViews[tab.key],
                                })}`}
                                onClick={this.onTabClickHandler(tab)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                    <div className={styles.Divider} />
                    <div className={styles.Tabs}>
                        {lowerTabs.map((tab) => (
                            <div
                                key={tab.key}
                                className={`${styles.Tab} ${classNames({
                                    [styles.Active]:
                                        this.state.showTabViews[tab.key],
                                })}`}
                                onClick={this.onTabClickHandler(tab)}
                            >
                                {tab.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles.Content}>
                    <Route
                        router={this.router}
                        pattern={marketplaceManagedRoutePattern}
                    >
                        <ManagedTabComponent deps={this.props.deps} />
                    </Route>
                    <Route
                        router={this.router}
                        pattern={marketplaceInstalledRoutePattern}
                    >
                        <InstalledTabComponent deps={this.props.deps} />
                    </Route>
                    <Route
                        router={this.router}
                        pattern={marketplaceDiscoverRoutePattern}
                    >
                        <DiscoverTabComponent deps={this.props.deps} />
                    </Route>
                    <Route
                        router={this.router}
                        pattern={marketplaceFilterRoutePattern}
                    >
                        <FilterTabComponent deps={this.props.deps} />
                    </Route>
                </div>
            </div>
        );
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
                        marketplaceManagedRoutePattern,
                    )
                ) {
                    this.setState({
                        showTabViews: {
                            managed: true,
                        },
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(
                        marketplaceInstalledRoutePattern,
                    )
                ) {
                    this.setState({
                        showTabViews: {
                            installed: true,
                        },
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(
                        marketplaceDiscoverRoutePattern,
                    )
                ) {
                    this.setState({
                        showTabViews: {
                            discover: true,
                        },
                    });
                } else if (
                    routeUpdate.routePattern.startsWith(
                        marketplaceFilterRoutePattern,
                    )
                ) {
                    const tag = getTag(routeUpdate.params);
                    if (tag) {
                        this.setState({
                            showTabViews: {
                                [formatFilterTabKey(tag)]: true,
                            },
                        });
                    }
                }
            }
        })().then();
    }

    private onTabClickHandler = <Key,>(tab: Tab<Key>) => {
        return () => {
            this.setState({
                showTabViews: {},
            });
            const route = tab.getRoute(this.localStore);
            this.router.navigateTo(route);
        };
    };
}

function formatFilterTabKey(tag: string): string {
    return `filter/tag=${tag}`;
}
